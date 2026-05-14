const express = require('express');
const cors = require('cors');
const config = require('./common/config/env');
const logger = require('./common/config/logger');
const errorHandler = require('./common/middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const patientRoutes = require('./modules/patients/patient.routes');
const diagnosisRoutes = require('./modules/diagnoses/diagnosis.routes');

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.use((req, _res, next) => {
  req.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/diagnoses', diagnosisRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

module.exports = app;
