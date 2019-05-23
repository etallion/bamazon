var mysql = require('mysql');
var inquirer = require('inquirer');

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

connection.connect(function(err) {
    if (err) throw err;
    viewInventory();
	
});

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
					'Enter new song',
					'View all songs',
					'Update a song',
					'Remove a song',
				],
			},
		])
		.then(answer => {
			switch (answer.menuItem) {
				case 'Enter new song':
					newSong();
					break;
				case 'View all songs':
					viewSongs();
					break;
				case 'Update a song':
					updateSong();
					break;
				case 'Remove a song':
					removeSong();
					break;
				default:
					console.log('That is not an option');
					showMenu();
			}
		});
}

function viewInventory() {
	console.log('VIEW Inventory');
	connection.query('SELECT * FROM products', function(err, res) {
		if (err) throw err;
		console.log('------------ Products ------------');
		console.log('Item#\tName\tDepartment\tPrice\tQuantity');
		res.forEach(item => {
			const { item_id, product_name, department_name, price, stock_quantity } = item;
			const print = item_id + '\t' + product_name + '\t' + department_name + '\t' + price + '\t' + stock_quantity;
			console.log(print);
		});
		showMenu();
	});
}
function viewSongs() {
	console.log('VIEW SONGS');
	connection.query('SELECT * FROM songs', function(err, res) {
		if (err) throw err;
		console.log('------------ SONGS ------------');
		console.log('ID\tTitle\tGenre\tArtist');
		res.forEach(song => {
			const { id, title, genre, artist } = song;
			const print = id + '\t' + title + '\t' + genre + '\t' + artist;
			console.log(print);
		});
		showMenu();
	});
}

function updateSong() {
	inquirer
		.prompt([
			{
				name: 'songId',
				message: 'Enter the Id of Song:',
			},
		])
		.then(function(answer) {
			getUpdate(answer.songId);
		});
}

function removeSong() {
	inquirer
		.prompt([
			{
				name: 'songId',
				message: 'Enter the Id of Song:',
			},
		])
		.then(function(answer) {
			connection.query(
				'DELETE FROM songs WHERE id=?',
				[answer.songId],
				function(err, res) {
					if (err) throw err;
					console.log('Your song was removed.');
					showMenu();
				},
			);
		});
}

function getUpdate(id) {
	inquirer
		.prompt([
			{
				name: 'title',
				message: 'Enter the new title',
			},
		])
		.then(function(answer) {
			connection.query(
				'UPDATE songs SET title=? WHERE id=?',
				[answer.title, id],
				function(err, res) {
					if (err) throw err;
					console.log('Your update was successful!');
					showMenu();
				},
			);
		});
}

function newSong() {
	inquirer
		.prompt([
			{
				name: 'title',
				message: 'Enter a Song Title:',
			},
			{
				name: 'artist',
				message: "Enter the Song's Artist:",
			},
			{
				name: 'genre',
				message: 'Enter the song Genre:',
			},
		])
		.then(answers => {
			const { title, artist, genre } = answers;
			connection.query(
				'INSERT INTO songs SET ?',
				{
					title,
					artist,
					genre,
				},
				function(err) {
					if (err) throw err;
					console.log('Your song was created successfully!');
					showMenu();
				},
			);
		});
}

// function queryAllSongs() {
// 	connection.query('SELECT * FROM songs', function(err, res) {
// 		console.log(res);
// 		for (var i = 0; i < res.length; i++) {
// 			console.log(
// 				res[i].id +
// 					' | ' +
// 					res[i].title +
// 					' | ' +
// 					res[i].artist +
// 					' | ' +
// 					res[i].genre,
// 			);
// 		}
// 		console.log('-----------------------------------');
// 	});
// }

// function queryDanceSongs() {
// 	var query = connection.query(
// 		'SELECT * FROM songs WHERE genre=?',
// 		['Dance'],
// 		function(err, res) {
// 			for (var i = 0; i < res.length; i++) {
// 				console.log(
// 					res[i].id +
// 						' | ' +
// 						res[i].title +
// 						' | ' +
// 						res[i].artist +
// 						' | ' +
// 						res[i].genre,
// 				);
// 			}
// 		},
// 	);

// 	// logs the actual query being run
// 	console.log(query.sql);
// }
