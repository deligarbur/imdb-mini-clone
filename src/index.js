const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// create and config server
const server = express();
server.use(cors());
server.use(express.json({ limit: '25mb' }));
server.set('view engine', 'ejs');

// esa será la función que nos conecta con la db
const dbConnect = require('../config/connection');
dbConnect();

// modelo
const Movie = require('../models/movies');

// endpoints
server.get('/movies', async (req, res) => {
	try {
		//query params
		const sortFilterParam = req.query.sort;
		console.log(sortFilterParam);
		//const genreFilterParam = req.query.genre;
		//console.log(genreFilterParam);

		let data;
		let sortObject = {}; // Declaración de un objeto de ordenación
		if (sortFilterParam === 'asc') {
			sortObject = { title: 1 }; // Ordenar ascendentemente por título
		} else if (sortFilterParam === 'desc') {
			sortObject = { title: -1 }; // Ordenar descendentemente por título
		}

		data = await Movie.find({}).sort(sortObject); // Realiza la consulta

		res.json({ success: true, data: data });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error al obtener la lista de películas.');
	}
});

server.get('/movie/:movieId', async (req, res) => {
	const movieId = req.params.movieId;
	const conn = await connectionDB();
	const select = 'SELECT * FROM movies WHERE idMovies = ?';
	//todas las sentencias sql con variables tengo que ejecutarlas en la query y tendré 2 parámetros, la sentencia y el listado de variables que tenga
	const [results] = await conn.query(select, [movieId]);
	//mando el primer elemento del array results, que es un objeto y así después es má sencillo operar con los datos en mi ejs
	res.render('detail', { movie: results[0] });
	await conn.end();
});

//endpoint de registro
server.post('/sign-up', async (req, res) => {
	const conn = await connectionDB();
	const { email, password } = req.body;
	const selectEmail = 'SELECT * FROM users WHERE email = ?';
	const [emailResult] = await conn.query(selectEmail, [email]);

	if (emailResult.length === 0) {
		const hashPassword = await bcrypt.hash(password, 10); //encriptamos la contraseña
		const insertUser = 'INSERT INTO users (email, password) VALUES (?,?)';
		const [newUser] = await conn.query(insertUser, [email, hashPassword]);
		res.status(201).json({ success: true, id: newUser.insertId });
		console.log(newUser);
	} else {
		//el usuario existe en la base de datos --> respondemos con un mensaje de que ya está registrado
		res.status(200).json({ success: false, message: 'Usuario ya existe' });
	}
	await conn.end();
});
//endpoint de login
server.post('/login', async (req, res) => {
	const conn = await connectionDB();
	//console.log(req.body);
	const { email, password } = req.body;
	const selectUser = 'SELECT * FROM users WHERE email = ?';
	const [resultUser] = await conn.query(selectUser, [email]);

	if (resultUser.length !== 0) {
		const isSamePassword = await bcrypt.compare(
			password, //esta variable contiene la contraseña que el usuario acaba de meter en el login (viene de los body params)
			resultUser[0].password
		);
		if (isSamePassword) {
			//si la contraseña coincide --> crear el token
			const infoToken = { email: resultUser[0].email, id: resultUser[0].id };
			const token = jwt.sign(infoToken, 'secret_lo_que_quieras', {
				expiresIn: '1h',
			});
			res.status(201).json({ success: true, token: token });
		} else {
			//si no --> enviar msj de contraseña incorrecta
			res
				.status(400)
				.json({ success: false, message: 'contraseña incorrecta' });
		}
	} else {
		//si el email no existe --> msj de email incorrecto
		res.status(400).json({ success: false, message: 'email incorrecto' });
	}
});

//Nos hemos quedado en el 4.10. De ese solo falta ajustar la respuesta del login y el punto 3. Bonus Mantén logueada a la usuaria

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
	console.log(`Server listening at http://localhost:${serverPort}`);
});
