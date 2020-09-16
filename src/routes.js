import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymenController from './app/controllers/DeliverymenController';
import OrderController from './app/controllers/OrderController';

import DeliveryController from './app/controllers/DeliveryController';
import DeliveryProblems from './app/controllers/DeliveryProblems';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveryController.index);
routes.put(
  '/deliveryman/:id/deliveries/:deliveryId',
  DeliveryController.update
);
routes.get('/delivery/:id/problems', DeliveryProblems.index);
routes.post('/delivery/:id/problems', DeliveryProblems.store);

// Middleware de autenticação, colocar antes da rota dos recipients
routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliveryman', DeliverymenController.index);
routes.post('/deliveryman', DeliverymenController.store);
routes.put('/deliveryman/:id', DeliverymenController.update);
routes.delete('/deliveryman/:id', DeliverymenController.delete);

routes.get('/orders/:id', OrderController.index);
routes.post('/orders', OrderController.store);

routes.post('/files', upload.single('file'), FileController.store);

module.exports = routes;
