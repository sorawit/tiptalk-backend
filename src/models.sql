CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  display_name  VARCHAR(255) NOT NULL,
  display_img   VARCHAR(255) NOT NULL,

  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
  user_1        INTEGER REFERENCES users(id),
  user_2        INTEGER REFERENCES users(id),
  status        VARCHAR(10) NOT NULL, -- 'pending' 'accepted'

  PRIMARY KEY (user_1, user_2),
  CHECK (user_1 <> user_2)
);

---

DROP TABLE friendships;
DROP TABLE users;