const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const seeder = require('./seed.js')

const sequelize = new Sequelize({
    storage: 'parcial.db',
    dialect: 'sqlite',
    define: {
        defaultScope: {
            attributes: { exclude: ['createdAt', 'updatedAt', 'programador_proyecto'] },
        },
    },
});

/* Modelos */

const Proyecto = sequelize.define('proyectos', {
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    descripcion: {
        type: Sequelize.STRING,
    },
    lenguaje: {
        type: Sequelize.ENUM('PHP', 'JAVASCRIPT', 'C++', 'JAVA'),
        allowNull: false,
    },
    activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
});

const Programador = sequelize.define('programadores', {
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    seniority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10,
        },
    },
});

/* Relacion entre tablas */

Proyecto.belongsToMany(Programador, { through: 'programador_proyecto', as: 'programadores' });
Programador.belongsToMany(Proyecto, { through: 'programador_proyecto', as: 'proyectos' });

app.use(bodyParser.json());
sequelize.sync({ force: true })
    .then(() => {
        app.listen(port, () => {
            popular();
            console.log('El servidor está corriendo en el puerto ' + port);
        });
    })
    .catch((error) => {
        console.error('Error al sincronizar la base de datos:', error);
    });

async function popular() {
    const qProyectos = await Proyecto.count();
    const qProgramadores = await Programador.count();
    if (qProyectos == 0 && qProgramadores == 0) {
        await Programador.bulkCreate(seeder.programadores, { validate: true });
        await Proyecto.bulkCreate(seeder.proyectos, { validate: true });
        let proyectos = await Proyecto.findAll()
        let programadores = await Programador.findAll()

        await proyectos[0].addProgramadores(programadores[0])
        await proyectos[0].addProgramadores(programadores[1])
        await proyectos[1].addProgramadores(programadores[2])
        await proyectos[1].addProgramadores(programadores[0])
        await proyectos[2].addProgramadores(programadores[2])
    }
}


app.get('/programadores', async (req, res) => {
    const programadores = await Programador.findAll();
    res.json(programadores);
});

app.get('/programadores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const programadores = await Programador.findByPk(id, {
            include: 'proyectos'
        });
        if (programadores === null) {
            res.status(404).json({ error: `No se encontró el programador con ID ${id}.` });
        } else {
            res.json(programadores);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
    }
})

app.post('/programadores/', async (req, res) => {
    try {
        const programador = await Programador.build(req.body)
        await programador.validate();
        const programadorValidado = await Programador.create(req.body);
        res.json({ id: programadorValidado.id });
    } catch (error) {
        console.error(error);
        res.status(409).json({ errores: error.errors.map(function (e) { return e.message; }) });
    }
})

app.patch('/programadores/:id', async (req, res) => {
    const { id } = req.params;
    const programadorNuevo = req.body;
    try {
        const [, affectedRows] = await Programador.update(
            programadorNuevo,
            { where: { id } }
        );
        if (affectedRows === 0) {
            res.status(404).json({ error: `No se encontró el programador con ID ${id}.` });
        } else {
            res.json({ id: id });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
    }
})

app.delete('/programadores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const programador = await Programador.findOne({ where: { id } });
        if (!programador) {
            return res.status(404).json({ error: 'Programador no encontrado' });
        }
        await programador.destroy();
        res.json('ok');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/proyectos', async (req, res) => {
    const proyectos = await Proyecto.findAll();
    res.json(proyectos);
})

app.get('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const proyecto = await Proyecto.findByPk(id, {
            include: 'programadores'
        });
        if (proyecto === null) {
            res.status(404).json({ error: `No se encontró el proyecto con ID ${id}.` });
        } else {
            res.json(proyecto);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al ejecutar la consulta.' });
    }
})

app.post('/proyectos', async (req, res) => {
    try {
        const proyecto = await Proyecto.build(req.body)
        await proyecto.validate();
        const proyectoValidado = await Proyecto.create(req.body);
        res.json({ id: proyectoValidado.id });
    } catch (error) {
        console.error(error);
        res.status(409).json({ errores: error.errors.map(function (e) { return e.message; }) });
    }
})

app.patch('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    const proyectoUpdate = req.body;
    try {
        const [, affectedRows] = await Proyecto.update(
            proyectoUpdate,
            { where: { id } }
        );
        if (affectedRows === 0) {
            res.status(404).json({ error: `No se encontró el proyecto con ID ${id}.` });
        } else {
            res.json({ id: id });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ha ocurrido un error al actualizar los datos.' });
    }
})

app.delete('/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const proyecto = await Proyecto.findOne({ where: { id } });
        if (!Proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        await proyecto.destroy();
        res.json('ok');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/proyectos/:idproyecto/programadores/:idprogramador', async (req, res) => {
    const { idproyecto, idprogramador } = req.params;
    try {
        const proyecto = await Proyecto.findOne({ where: { id : idproyecto } });
        const programador = await Programador.findOne({ where: { id: idprogramador } });
        if (!Proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        } else {
            proyecto.addProgramadores(programador)
            res.json('ok');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/proyectos/:idproyecto/programadores/:idprogramador', async (req, res) => {
    const { idproyecto, idprogramador } = req.params;
    try {
        const programador = await Programador.findOne({ where: { id: idprogramador } });
        const proyecto = await Proyecto.findOne({ where: { id: idproyecto } });
        if (!Proyecto) {
            return res.status(404).json({ error: 'Programdor no encontrado' });
        } else {
            programador.addProyecto(proyecto)
            res.json('ok');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/proyectos/:idproyecto/programadores/:idprogramador', async (req, res) => {
    const { idproyecto, idprogramador } = req.params;
    try {
        const programador = await Programador.findOne({ where: { id: idprogramador } });
        const proyecto = await Proyecto.findOne({ where: { id: idproyecto } });
        if (!Proyecto) {
            return res.status(404).json({ error: 'Programdor no encontrado' });
        } else {
            proyecto.
            res.json('ok');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

});