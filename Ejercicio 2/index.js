/* 
GET alumnos: listado de todos los alumnos con sus datos del objeto (sin materias).
GET alumnos/:id : detalle de un alumno con id dado. Incluye las cursadas

POST alumno: crea un alumno
POST alumnos/:id/cursada : recibe un objeto "Cursada" sin el campo "aprobada" que va en null por defecto.

PATCH alumno/:id : actualiza un alumno un alumno con id dado.
PATCH cursada/aprobar/:id : recibe un objeto vacío y actualiza el campo "aprobada" a true de la cursada cuyo id se recibe `por url.
PATCH cursada/reprobar/:id : recibe un objeto vacío y actualiza el campo "aprobada" a false de la cursada cuyo id se recibe `por url.

DELETE alumno/:id : borra un alumno un alumno con id dado.
DELETE cursada/:id : borra una cursada con id dado.
*/

const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    storage: 'db_alumnos.db',
    dialect: 'sqlite',
    define: {
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
    },
});

const ClaseAlumno = sequelize.define('alumno', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El campo "email" no puede ser nulo'
            },
            notEmpty: {
                msg: 'El campo "email" no puede estar vacío'
            },
            isEmail: true
        }
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El campo "fecha de nacimiento" no puede ser nulo'
            },
            notEmpty: {
                msg: 'El campo "fecha de nacimiento" no puede estar vacío'
            },
            isDate: true
        }
    }
})

const ClaseCursada = sequelize.define('cursadas', {
    materia: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El campo "materia" no puede ser nulo'
            },
            notEmpty: {
                msg: 'El campo "materia" no puede estar vacío'
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
            }
        }
    },
    cuatrimestre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 2,
            notNull: {
                msg: 'El campo "cutrimestre" no puede ser nulo'
            },
            notEmpty: {
                msg: 'El campo "cuatrimestre" no puede estar vacío'
            }
        }
    },
    aprobada: {
        type: DataTypes.BOOLEAN,
    }
})

ClaseAlumno.hasMany(ClaseCursada, { as: 'cursadas' });




app.use(bodyParser.json());
sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            alumnosExist();
            console.log('El servidor está corriendo en el puerto ' + port);
        });
    })
    .catch((error) => {
        console.error('Error al sincronizar la base de datos:', error);
    });

app.get('/alumnos', async (req, res) => {
    const alumnos = await ClaseAlumno.findAll()
    res.json(alumnos)
});

app.get('/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const alumno = await ClaseAlumno.findByPk(id, {
            include: 'cursadas'
        });
        if (alumno === null) {
            res.status(404).json({ error: `No se encontró el alumno con ID ${id}.` });
        } else {
            res.json(alumno);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
    }
});

app.post('/alumnos', async (req, res) => {
    try {
        const unAlumno = await ClaseAlumno.build(req.body)
        await unAlumno.validate();
        const unAlumnoValidado = await ClaseAlumno.create(req.body);
        res.json({ id: unAlumnoValidado.id });
    } catch (error) {
        console.error(error);
        res.status(409).json({ errores: error.errors.map(function (e) { return e.message; }) });
    }
});

app.post('/alumnos/:id/cursada', async (req, res) => {
    const { id } = req.params;
    const cursada = req.body;
    try {
        const unaMateria = await ClaseCursada.build(
            {
                materia: cursada.materia,
                aprobada: null,
                anio: cursada.anio,
                cuatrimestre: cursada.cuatrimestre,
                alumnoId: id
            }
        );
        await unaMateria.validate();
        const unaMateriaValidada = await ClaseCursada.create({
            materia: cursada.materia,
            aprobada: null,
            anio: cursada.anio,
            cuatrimestre: cursada.cuatrimestre,
            alumnoId: id
        });
        res.json({ id: unaMateriaValidada.id });
    } catch (error) {
        console.error(error);
        res.status(409).json({ errores: error.errors.map(function (e) { return e.message; }) });
    }
});

app.patch('/alumno/:id', async (req, res) => {
    const { id } = req.params;
    const alumnoNuevo = req.body;
    try {
        const [, affectedRows] = await ClaseAlumno.update(
            alumnoNuevo,
            { where: { id } }
        );
        if (affectedRows === 0) {
            res.status(404).json({ error: `No se encontró el alumno con ID ${id}.` });
        } else {
            res.json({ id: id });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
    }
});

app.patch('/cursada/reprobar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [, affectedRows] = await ClaseCursada.update(
            {
                aprobada: false,
            },
            {
                where: { id }
            }
        );
        if (affectedRows === 0) {
            res.status(404).json({ error: `No se encontró la materia con ID ${id}.` });
        } else {
            res.json({ id: id });
        }
    } catch (error) {

    }
});

app.patch('/cursada/aprobar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [, affectedRows] = await ClaseCursada.update(
            {
                aprobada: true,
            },
            {
                where: { id }
            }
        );
        if (affectedRows === 0) {
            res.status(404).json({ error: `No se encontró la materia con ID ${id}.` });
        } else {
            res.json({ id: id });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
    }
});


app.delete('/alumnos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const alumno = await ClaseAlumno.findOne({ where: { id } });
        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        await alumno.destroy();
        res.json('ok');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/cursada/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cursada = await ClaseCursada.findOne({ where: { id } });
        if (!cursada) {
            return res.status(404).json({ error: 'Cursada no encontrado' });
        }
        await cursada.destroy();
        res.json('ok');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


async function alumnosExist() {
    const qAlumno = await ClaseAlumno.count();
    const qClases = await ClaseCursada.count();

    if (qAlumno == 0 && qClases == 0) {
        const alumnos = [
            { nombre: 'Nahuel', email: 'nahuel@gmail.com', fecha_nacimiento: '02/03/1996' }
        ]

        const cursadas = [
            { materia: 'Logica', aprobada: null, anio: 2019, cuatrimestre: 1, alumnoId: 1 }
        ]
        ClaseAlumno.bulkCreate(alumnos, { validate: true })
        ClaseCursada.bulkCreate(cursadas, { validate: true })
    }
}