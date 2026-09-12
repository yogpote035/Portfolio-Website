CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  password_reset_token_hash VARCHAR(255) NULL,
  password_reset_expires_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_users_role (role),
  INDEX idx_admin_users_reset_token (password_reset_token_hash)
);

CREATE TABLE IF NOT EXISTS media (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  storage_provider ENUM('local', 'cloudinary') NOT NULL DEFAULT 'local',
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NULL,
  folder VARCHAR(120) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_media_provider_folder_created (storage_provider, folder, created_at),
  INDEX idx_media_public_id (public_id)
);

CREATE TABLE IF NOT EXISTS profile (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  designation VARCHAR(160) NOT NULL,
  cover_photo_media_id BIGINT UNSIGNED NULL,
  about_image_media_id BIGINT UNSIGNED NULL,
  about TEXT NULL,
  email VARCHAR(160) NULL,
  phone VARCHAR(40) NULL,
  location VARCHAR(160) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_cover_media
    FOREIGN KEY (cover_photo_media_id) REFERENCES media(id) ON DELETE SET NULL,
  CONSTRAINT fk_profile_about_media
    FOREIGN KEY (about_image_media_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS social_links (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(80) NOT NULL,
  icon VARCHAR(80) NOT NULL,
  url VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_social_links_profile
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  INDEX idx_social_links_profile_order (profile_id, display_order)
);

CREATE TABLE IF NOT EXISTS hero_roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT UNSIGNED NOT NULL,
  role VARCHAR(180) NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hero_roles_profile
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  INDEX idx_hero_roles_profile_order (profile_id, display_order)
);

CREATE TABLE IF NOT EXISTS portfolio_stats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profile_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(180) NOT NULL,
  value VARCHAR(120) NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_portfolio_stats_profile
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  INDEX idx_portfolio_stats_profile_order (profile_id, display_order)
);

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category ENUM('frontend', 'backend', 'database', 'devops', 'languages', 'cloud', 'tools', 'ai') NOT NULL,
  logo_media_id BIGINT UNSIGNED NULL,
  color VARCHAR(32) NULL,
  level TINYINT UNSIGNED NULL,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_skills_category_order (category, display_order)
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  short_description VARCHAR(500) NOT NULL,
  full_description TEXT NOT NULL,
  subtitle VARCHAR(255) NULL,
  thumbnail_media_id BIGINT UNSIGNED NULL,
  cover_media_id BIGINT UNSIGNED NULL,
  github_url VARCHAR(255) NULL,
  live_url VARCHAR(255) NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  company_project BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('planned', 'in_progress', 'completed', 'archived') NOT NULL DEFAULT 'completed',
  completion_date DATE NULL,
  display_order INT NOT NULL DEFAULT 1,
  responsibilities JSON NULL,
  features JSON NULL,
  challenges JSON NULL,
  future_improvements JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_projects_featured_order (featured, display_order),
  INDEX idx_projects_status (status)
);

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id BIGINT UNSIGNED NOT NULL,
  skill_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (project_id, skill_id),
  CONSTRAINT fk_project_technologies_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_technologies_skill
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_gallery (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  media_id BIGINT UNSIGNED NOT NULL,
  alt_text VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_gallery_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_gallery_media
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
  INDEX idx_project_gallery_project_order (project_id, display_order)
);

CREATE TABLE IF NOT EXISTS project_features (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_features_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_features_project_order (project_id, display_order)
);

CREATE TABLE IF NOT EXISTS project_responsibilities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_responsibilities_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_responsibilities_project_order (project_id, display_order)
);

CREATE TABLE IF NOT EXISTS project_challenges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_challenges_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_challenges_project_order (project_id, display_order)
);

CREATE TABLE IF NOT EXISTS project_future_improvements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_future_improvements_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_future_improvements_project_order (project_id, display_order)
);

CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(180) NOT NULL,
  company_logo_media_id BIGINT UNSIGNED NULL,
  job_title VARCHAR(180) NOT NULL,
  employment_type VARCHAR(80) NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  current_company BOOLEAN NOT NULL DEFAULT FALSE,
  location VARCHAR(160) NULL,
  description TEXT NULL,
  responsibilities JSON NULL,
  technologies JSON NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_experiences_company_logo_media
    FOREIGN KEY (company_logo_media_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS experience_technologies (
  experience_id BIGINT UNSIGNED NOT NULL,
  skill_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (experience_id, skill_id),
  CONSTRAINT fk_experience_technologies_experience
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
  CONSTRAINT fk_experience_technologies_skill
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS education (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  degree VARCHAR(180) NOT NULL,
  college VARCHAR(220) NOT NULL,
  university VARCHAR(220) NULL,
  cgpa VARCHAR(40) NULL,
  percentage VARCHAR(40) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  description TEXT NULL,
  coursework JSON NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NULL,
  company VARCHAR(160) NULL,
  subject VARCHAR(220) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread',
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contacts_status_created (status, created_at),
  INDEX idx_contacts_starred (is_starred)
);

CREATE TABLE IF NOT EXISTS resumes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  download_count BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resumes_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_resumes_is_active (is_active)
);

CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_type ENUM('portfolio_visit', 'resume_download') NOT NULL,
  ip_address VARCHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_type_created (event_type, created_at)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(160) NOT NULL,
  entity_type VARCHAR(120) NULL,
  entity_id BIGINT UNSIGNED NULL,
  description VARCHAR(500) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_activity_logs_created (created_at)
);

CREATE TABLE IF NOT EXISTS content_versions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  snapshot JSON NOT NULL,
  summary VARCHAR(255) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_content_versions_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_content_versions_entity_version (entity_type, entity_id, version_number),
  INDEX idx_content_versions_entity_created (entity_type, entity_id, created_at)
);
