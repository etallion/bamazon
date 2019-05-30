
//-----------------======= Bamzaon Manager Portal =======-----------------
//Created: May 25, 2019
//By: Will Mangimelli
//Overview: 
// Inventory management tool for store. Tool gives manager users
// ability to:
// 1. View all inventory data
// 2. View low stocked item 	
// 3. Add inventory to existing item
// 4. Create in item
const LOW_LEVEL = 10;

//-----------------======= Packages =======-----------------
var mysql = require('mysql');
var inquirer = require('inquirer');

//-----------------======= Database =======-----------------
var connection = mysql.createConnection({
	host: 'localhost',

	// Your port; if not 3306
	port: 3306,

	// Your username
	user: 'root',

	// Your password
	password: '',
	database: 'bamazon',
});

//-----------------======= Connection =======-----------------
connection.connect(function(err) {
	if (err) throw err;
	showMenu();
});

//-----------------======= Main Menu =======-----------------
function showMenu() {
	console.log('\n');
	inquirer
		.prompt([
			{
				name: 'menuItem',
				message:
					'Hey there, what would you like to do. Please select one option:',
				type: 'list',
				choices: [
					'View Products for Sale',
					'View Low Inventory',
					'Add to Inventory',
					'Add New Product',
				],
			},
		])
		.then(answer => {
			switch (answer.menuItem) {
				case 'Add New Product':
					newProduct();
					break;
				case 'View Products for Sale':
					viewProducts();
					break;
				case 'Add to Inventory':
					updateInventory();
					break;
				case 'View Low Inventory':
					viewLowInventory();
					break;
				default:
					console.log('That is not an option');
					showMenu();
			}
		});
}

//-----------------======= Display Inventory =======-----------------
function viewProducts() {
	console.log('VIEW Products');
	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
        console.log('\n\t## Inventory Items ##');
			var products = [];
			res.forEach(item => {
				products.push(item);
			});
			console.table(products);
			showMenu()
	});
}

//-----------------======= View Low Inventory =======-----------------
function viewLowInventory() {
		connection.query('SELECT * FROM products WHERE stock_quantity<?', [LOW_LEVEL], function(err, res) {
			if (err) throw err;
			console.log('\n\t## Low Inventory Items ##');
			var products = [];
			res.forEach(item => {
				products.push(item);
			});
			console.table(products);
			showMenu();
		});
	}

//-----------------======= Update Stock Quantity =======-----------------
function updateInventory() {
	inquirer
		.prompt([
			{
				name: 'item_id',
				message: 'Enter the item ID:',
			},
		])
		.then(function(answer) {
			getStock_Quantity(answer.item_id);
		});
}

function getStock_Quantity(id){
	
	connection.query(
		'SELECT * FROM products WHERE item_id = ?',
		[id],
		function(err, res) {
			if (err) throw err;
			const { item_id, product_name, department_name, price, stock_quantity } = res[0]; //use item at zero index when searching by primary key and anticipating only 1 result.
			console.log('You currently have ' + stock_quantity + ' ' + product_name + ' in stock.');
			getUpdate(id, stock_quantity);
		}
	);
}

function getUpdate(id, currentStockQuantity) {
	inquirer
		.prompt([
			{
				name: 'amount',
				message: 'Enter the amount to add to inventory:',
			},
		])
		.then(function(answer) {
			var total = parseInt(answer.amount) + parseInt(currentStockQuantity);
			connection.query(
				'UPDATE products SET stock_quantity = ? WHERE item_id = ?',
				[parseInt(total), id],
				function(err, res) {
					if (err) throw err;
					console.log('Your update was successful! You now have ' + total + ' items in stock.');
					showMenu();
				},
			);
		});
}

//-----------------======= Create New Product in Inventory =======-----------------
function newProduct() {
    //later on we'll add a feature to allow manager
    //to create a new department and will then have
    //to query the database for the list of dept
    //so they all can be display during a the creation
    //of a new product
	inquirer
		.prompt([
			{
				name: 'product_name',
				message: 'Enter a Product Name:',
			},
			{
                name: 'department_name',
                type: 'list',
                message: "Choose a Department:",
                choices: [
					'Groceries',
					'Electronics',
					'Office',
					'Health',
				],
			},
			{
				name: 'price',
				message: 'Enter retail price',
            },
            {
				name: 'stock_quantity',
				message: 'Enter stock quantity',
			},
		])
		.then(answers => {
			const { product_name, department_name, price, stock_quantity } = answers;
			connection.query(
				'INSERT INTO products SET ?',
				{
					product_name,
					department_name,
                    price,
                    stock_quantity,
				},
				function(err) {
					if (err) throw err;
					console.log('Your prodcut was created successfully!');
					showMenu();
				},
			);
		});
}

//-----------------======= Remove product from Inventory =======-----------------
function removeProduct() {
	inquirer
		.prompt([
			{
				name: 'item_id',
				message: 'Enter the ID of the product you wish to delete:',
			},
		])
		.then(function(answer) {
			connection.query(
				'DELETE FROM products WHERE item_id=?',
				[answer.item_id],
				function(err, res) {
					if (err) throw err;
					console.log('Your product was deleted.');
					showMenu();
				},
			);
		});
}