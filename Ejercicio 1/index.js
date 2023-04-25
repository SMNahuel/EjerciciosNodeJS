const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  storage: 'db_musicos.db',
  dialect: 'sqlite',
  define: {
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    },
  },
});

const Musico = sequelize.define('musicos', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "nombre" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "nombre" no puede estar vacío'
      }
    }
  },
  en_actividad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    validate: {
      isIn: {
        args: [[0, 1, false, true]],
        msg: 'El campo "en_actividad" debe ser una de las siguientes opciones: 1 / true (=verdadero) ó 0 / false (=falso)'
      }
    }
  },
  instrumento: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "instrumento" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "instrumento" no puede estar vacío'
      },
      isIn: {
        args: [['guitarra', 'batería', 'bajo', 'teclado', 'voz']],
        msg: 'El campo "instrumento" debe ser una de las siguientes opciones: guitarra, batería, bajo, voz o teclado'
      }
    }
  }
});

const Cancion = sequelize.define('canciones', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "titulo" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "titulo" no puede estar vacío'
      }
    }
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El campo "anio" no puede ser nulo'
      },
      notEmpty: {
        msg: 'El campo "anio" no puede estar vacío'
      },
      max: 2100,
      min: 1,
    }
  },
});

Musico.hasMany(Cancion, { as: 'canciones' });

app.use(bodyParser.json());

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      popular();
      console.log('El servidor está corriendo en el puerto ' + port);
    });
  })
  .catch((error) => {
    console.error('Error al sincronizar la base de datos:', error);
  });

app.get('/musicos', async (req, res) => {
  const data = await Musico.findAll()
  res.json(data)
});

app.get('/musicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unMusico = await Musico.findByPk(id, {
      include: 'canciones'
    });
    if (unMusico === null) {
      res.status(404).json({ error: `No se encontró el músico con ID ${id}.` });
    } else {
      res.json(unMusico);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});


app.get('/canciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unaCancion = await Cancion.findByPk(id);
    if (unaCancion === null) {
      res.status(404).json({ error: `No se encontró la canción con ID ${id}.` });
    } else {
      res.json(unaCancion);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
  }
});

app.post('/musicos/', async (req, res) => {
  try {
    const unMusico = await Musico.build(req.body);
    await unMusico.validate();
    const unMusicoValidado = await Musico.create(req.body);
    res.json({id: unMusicoValidado.id});
  } catch (error) {
    console.error(error);
    res.status(409).json({ errores: error.errors.map(function (e) {return e.message;}) });
  }
});

app.patch('/musicos/:id', async (req, res) => {
  const { id } = req.params;
  const unMusico = req.body;
 
  try {
    const [, affectedRows] = await Musico.update(
      unMusico,
      { where: { id } }
    );
    if (affectedRows === 0) {
      res.status(404).json({ error: `No se encontró el músico con ID ${id}.` });
    } else {
      res.json({ id: id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
  }
});

app.delete('/musicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const unMusico = await Musico.findOne({ where: { id } });
    if (!unMusico) {
      return res.status(404).json({ error: 'Musico no encontrado' });
    }
    await unMusico.destroy();
    res.json('ok');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


async function popular() {
  const qMusicos = await Musico.count();
  const qCanciones = await Cancion.count();
  if(qMusicos==0 && qCanciones==0) {
    const musicos = [
      { nombre: 'Jimi Hendrix', en_actividad: false, instrumento: 'guitarra' },
      { nombre: 'Flea', en_actividad: true, instrumento: 'bajo' },
      { nombre: 'Dave Grohl', en_actividad: true, instrumento: 'batería' },
      { nombre: 'Robert Trujillo', en_actividad: true, instrumento: 'bajo' },
      { nombre: 'Tom Morello', en_actividad: true, instrumento: 'guitarra' }
    ];

    const canciones = [
      { titulo: 'Purple Haze', anio: 1967, musicoId: 1 },
      { titulo: 'Hey Joe', anio: 1966, musicoId: 1 },
      { titulo: 'Around The World', anio: 1999, musicoId: 2 },
      { titulo: 'Dani California', anio: 2006, musicoId: 2 },
      { titulo: 'Everlong', anio: 1997, musicoId: 3 },
      { titulo: 'All My Life', anio: 2002, musicoId: 3 },
      { titulo: 'For Whom the Bell Tolls', anio: 1984, musicoId: 4 },
      { titulo: 'One', anio: 1988, musicoId: 4 },
      { titulo: 'Bulls on Parade', anio: 1996, musicoId: 5 },
      { titulo: 'Killing in the Name', anio: 1992, musicoId: 5 }
    ];
    Musico.bulkCreate(musicos, { validate: true });
    Cancion.bulkCreate(canciones, { validate: true });
  }
}