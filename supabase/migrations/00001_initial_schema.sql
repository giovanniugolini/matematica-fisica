-- ============================================
-- FORMA - Schema Iniziale
-- Migrazione: 00001_initial_schema
-- Data: Gennaio 2026
-- ============================================

-- ============================================
-- PROFILES
-- Estende auth.users con dati aggiuntivi
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'school')),
  ai_credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger per creare profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ARTIFACTS
-- Contenitore polimorfico per lezioni, demo, quiz, percorsi
-- ============================================
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'demo', 'quiz', 'path')),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT CHECK (subject IN ('matematica', 'fisica')),
  topic TEXT,
  level TEXT CHECK (level IN ('base', 'intermedio', 'avanzato')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  content JSONB NOT NULL DEFAULT '{}',
  source_md TEXT,
  forked_from UUID REFERENCES artifacts(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indici per query comuni
CREATE INDEX idx_artifacts_owner ON artifacts(owner_id);
CREATE INDEX idx_artifacts_type ON artifacts(type);
CREATE INDEX idx_artifacts_subject ON artifacts(subject);
CREATE INDEX idx_artifacts_status_visibility ON artifacts(status, visibility);

-- ============================================
-- QUIZ RESULTS
-- Risultati delle verifiche svolte
-- ============================================
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score::DECIMAL / max_score * 100) ELSE 0 END
  ) STORED,
  answers JSONB NOT NULL,
  time_spent INTEGER, -- secondi
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_quiz ON quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_user ON quiz_results(user_id);

-- ============================================
-- FAVORITES
-- Artefatti preferiti degli utenti
-- ============================================
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, artifact_id)
);

-- ============================================
-- PATH ITEMS
-- Elementi che compongono un percorso didattico
-- ============================================
CREATE TABLE path_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  artifact_id UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  UNIQUE (path_id, order_index)
);

CREATE INDEX idx_path_items_path ON path_items(path_id);

-- ============================================
-- FUNZIONI UTILITY
-- ============================================

-- Aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_items ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ARTIFACTS
CREATE POLICY "Published public artifacts are viewable by everyone"
  ON artifacts FOR SELECT
  USING (
    (status = 'published' AND visibility = 'public')
    OR owner_id = auth.uid()
  );

CREATE POLICY "Users can create own artifacts"
  ON artifacts FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own artifacts"
  ON artifacts FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own artifacts"
  ON artifacts FOR DELETE
  USING (owner_id = auth.uid());

-- QUIZ RESULTS
CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Teachers can view results for their quizzes
CREATE POLICY "Teachers can view results for own quizzes"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = quiz_results.quiz_id
      AND artifacts.owner_id = auth.uid()
    )
  );

-- FAVORITES
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id = auth.uid());

-- PATH ITEMS
CREATE POLICY "Path items viewable if path is viewable"
  ON path_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = path_items.path_id
      AND (
        (artifacts.status = 'published' AND artifacts.visibility = 'public')
        OR artifacts.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage items in own paths"
  ON path_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM artifacts
      WHERE artifacts.id = path_items.path_id
      AND artifacts.owner_id = auth.uid()
    )
  );
