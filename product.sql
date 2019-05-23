DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(11,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Nespresso Capsules", "Groceries", "22.50", "100"),
        ("Replace Screen Iphone 7", "Electronics", "29.50", "100"),
        ("Dove Antiperspirant", "Health", "4.50", "1000"),
        ("Lavazza Espresso", "Groceries", "21.60", "50"),
        ("Alkaline Batteries AAAA", "Electronics", "4.49", "200"),
        ("Mallomars", "Groceries", "16.65", "90"),
        ("Rubberbands", "Office", "3.87", "250"),
        ("Listerine", "Health", "6.13", "7"),
        ("3 Ring Binder", "Office", "11.50", "24"),
        ("Security IP Camera", "Electronics", "29.99", "44");

