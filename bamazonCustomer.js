
//-----------------======= Customer POS Portal =======-----------------
//Created: May 25, 2019
//By: Will Mangimelli
//Overview: 
// Point of Sale tool for Bamazon. Tool gives customer users
// ability to:
// 1. View all inventory data
// 2. Purchase item
// 3. Return item

//-----------------======= Packages =======-----------------
var mysql = require('mysql');
var inquirer = require('inquirer');

//-----------------======= Database Config =======-----------------
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
	appDidOpen();
	viewProducts();
	
});

//-----------------======= Main Menu =======-----------------
function showMenu() {
	console.log('\n');
	inquirer
		.prompt([
			{
				name: 'menuItem',
				message:
					'Please select an option:',
				type: 'list',
				choices: [
					'1. Show all products',
					'2. Make a purchase',
					'3. Make a return',
					
				],
			},
		])
		.then(answer => {
			switch (answer.menuItem) {
				case '2. Make a purchase':
					buy_ID();
					break;
				case '3. Make a return':
					returnGetID();
					break;
				case '1. Show all products':
					viewProducts();
					break;
				default:
					console.log('That is not an option');
			}
		});
}

function appDidOpen(){
	console.log('\n############################################################################################');
	console.log('############################################################################################');
	console.log('#################################                          #################################');
	console.log('#################################    WELCOME TO WHAMAZON   #################################');
	console.log('#################################                          #################################');
	console.log('############################################################################################');
	console.log('############################################################################################\n');
	console.log('\n\tHello and thank you for visting Whamazon! How may we assist you today?\n');
}

//-----------------======= Display Inventory =======-----------------
function viewProducts() {
	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
        //console.log('\n\t## Inventory Items ##');
			var products = [];
			res.forEach(item => {
				products.push(item);
			});
			console.table(products);
			showMenu()
	});
}

//-----------------======= Purchase Item  =======-----------------
function buy_ID() {
	inquirer
		.prompt([
			{
				name: 'item_id',
				message: 'Enter Item ID:',
			},
		]).then(answer=> {
			isProductAvailable(answer.item_id)
				.then(function(results){
					buy_Qty(answer.item_id);
				})
				.catch(function(err){
				console.log("Oops! "+err);
				showMenu();
				})
		});
}

 function isProductAvailable(id){
	return new Promise(function(resolve, reject){
	  connection.query(
		'SELECT stock_quantity FROM products WHERE item_id = ?',
		 [id], function(err, res) {
			if(err) {
				console.log("That's weird, something went wrong. " + err.message);
				showMenu();
			} else if (res.length === 0){
				console.log("Sorry, but that is not a valid item ID");
				buy_ID();
			} else {                                        
			  if(res[0].stock_quantity > 0){
				  resolve(true);
			  }else{
				  reject(new Error("No stock available!"));
			  }
		  	}
		 }
	   )}
  )};

function buy_Qty(id){
	var stock_quantity;
	var price;
	// Let's go ahead and obtain some info from database for the item the customer wants to buy 
	// and save it to some variables for later use.
	connection.query('SELECT price,stock_quantity FROM products WHERE item_id = ?', [id], function(err, res) {
		stock_quantity = res[0].stock_quantity;
		price = res[0].price;
		if (err) throw err;
	});

	inquirer
		.prompt([
			{
			name: 'qty',
			message: 'How many would you like to buy?',
			validate: function(value) {
				// make sure input value was a number and greater than zero
				if (isNaN(value) === false && parseInt(value) > 0 && ) {
					//Make sure the user enters a quantity to purchase to is less than or equal the stock available
					if (stock_quantity < value) {
						console.log("\nInsufficient quantity. There is only " + stock_quantity + " items currently in stock.");
						console.log("Please choose an amount smaller or equal to the available stock quantity.");
						return false;
					}
					else{
						// There is adequate inventory to fill your order. Please wait while we process your order.
						return true;
					}
				} else {
					console.log("\nInvalid entry. Please enter a positive integer value for quantity.");
					return false;
				}//end of stock check if statement
			}//end of validation
		},//end of prompt object
	]).then(answers => {
		var updated_stock = parseInt(stock_quantity) - parseInt(answers.qty);
		connection.query(
			'UPDATE products SET ? WHERE ?',
			[{ stock_quantity : parseInt(updated_stock)}, {item_id : id}],
			function(err) {
				if (err) throw err;
				console.log('Thank you for your purchase!');
				var total = parseInt(answers.qty) * price;
				console.log('Your total receipt amount is $' + total.toFixed(2));
				showMenu();
			});
	});
}

//-----------------======= Return Item  =======-----------------
function returnGetID() {
	inquirer
		.prompt([
			{
				name: 'item_id',
				message: 'Enter item ID you with to return:',
			},
		]).then(answer=> {
			buy_item_id = answer.item_id;
			//console.log("ITEM ID =" + answer.item_id);
			makeReturn(answer.item_id);
		});
}
function makeReturn(id){
	var stock_quantity;
	var price;
	// Let's go ahead and obtain some info from database for the item the customer 
	// wishes to return and save it to some variables for later use.
	connection.query('SELECT price,stock_quantity FROM products WHERE item_id = ?', [id], function(err, res) {
		stock_quantity = res[0].stock_quantity;
		price = res[0].price;
		if (err) throw err;
	});

	inquirer
		.prompt([
			{
			name: 'return_quantity',
			message: 'How many are you returning?: ',
			validate: function(value) {
				// make sure input value was a number and greater than zero
				if (isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					console.log("\nInvalid entry. Please enter a positive integer value.");
					return false;
				}//end if statement
			}//end of validation
		},//end of prompt object
	]).then(answers => {
		const { item_id, return_quantity } = answers;
		var updated_stock = parseInt(stock_quantity) + parseInt(answers.return_quantity);
		connection.query(
			'UPDATE products SET ? WHERE ?',
			[{ stock_quantity : parseInt(updated_stock)}, {item_id : id}],
			function(err) {
				if (err) throw err;
				console.log('You are a valued customer and we look forward to your next visit!');
				var total = parseInt(answers.return_quantity) * price * -1;
				console.log('Your total credit amount is $' + total.toFixed(2));
				showMenu();
			});
	});
}

// Need to make sure we close the connection to databases for all possible app exits.