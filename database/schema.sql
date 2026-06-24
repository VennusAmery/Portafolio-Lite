CREATE DATABASE IF NOT EXISTS writer_portfolio
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE writer_portfolio;

-- Libros / PDFs
CREATE TABLE books (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  title        VARCHAR(255)    NOT NULL,
  description  TEXT            NULL,
  cover_url    VARCHAR(500)    NULL,
  pdf_path     VARCHAR(500)    NOT NULL,
  published_at DATE            NULL,
  view_count   INT UNSIGNED    NOT NULL DEFAULT 0,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_title (title),
  INDEX idx_date  (published_at)
) ENGINE=InnoDB;

-- Calificaciones (una por sesión anónima o usuario)
CREATE TABLE ratings (
  id         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  book_id    INT UNSIGNED     NOT NULL,
  stars      TINYINT UNSIGNED NOT NULL CHECK (stars BETWEEN 1 AND 5),
  ip_hash    VARCHAR(64)      NULL,
  created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_book (book_id),
  CONSTRAINT fk_ratings_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Vista: promedio de calificaciones
CREATE OR REPLACE VIEW v_book_ratings AS
SELECT
  book_id,
  ROUND(AVG(stars), 1) AS avg_stars,
  COUNT(*)             AS total_ratings
FROM ratings
GROUP BY book_id;

-- Comentarios generales
CREATE TABLE comments (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id    INT UNSIGNED NOT NULL,
  author     VARCHAR(80)  NOT NULL DEFAULT 'Anónimo',
  body       TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_book (book_id),
  CONSTRAINT fk_comments_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB;
