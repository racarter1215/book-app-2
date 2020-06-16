DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn INTEGER,
    image_url VARCHAR(255),
    description VARCHAR(255),
    bookshelf VARCHAR(255)
);

INSERT INTO books (
    author,
    title,
    isbn,
    image_url,
    description,
    bookshelf
)

VALUES (
    'test1',
    'test2',
    4444,
    'test4',
    'test5',
    'test6'
);

SELECT * FROM books;