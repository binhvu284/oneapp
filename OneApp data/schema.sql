-- OneApp Database Schema
-- This schema defines the structure for OneApp Database (local storage)
-- Note: Data stored here cannot be restored if the project is deleted

-- In use App Table
-- Stores information about all in-use applications in the OneApp system
CREATE TABLE IF NOT EXISTS in_use_app (
  _id VARCHAR(255) PRIMARY KEY,
  id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  shortDescription TEXT,
  path VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags JSON,
  enabled BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) NOT NULL,
  appType VARCHAR(50) NOT NULL,
  appTypeCategory VARCHAR(50),
  homeSection VARCHAR(100),
  createDate DATETIME,
  developer VARCHAR(255),
  publishDate DATETIME,
  managementStatus VARCHAR(50),
  image VARCHAR(500),
  publisher VARCHAR(255),
  appSize VARCHAR(50),
  sourceCodeUrl VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_appType (appType),
  INDEX idx_enabled (enabled)
);

-- Categories Table
-- Stores category information for organizing applications and content
CREATE TABLE IF NOT EXISTS categories (
  _id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  color VARCHAR(50),
  parentId VARCHAR(255),
  level INT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  isFeatured BOOLEAN DEFAULT false,
  appCount INT DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_parentId (parentId),
  FOREIGN KEY (parentId) REFERENCES categories(_id) ON DELETE SET NULL
);

