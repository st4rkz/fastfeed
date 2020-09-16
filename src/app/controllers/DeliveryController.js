import { parseISO, getHours, startOfDay, endOfDay, getTime } from 'date-fns';
import { Op } from 'sequelize';
import Order from '../models/Order';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: null,
      },
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
    });

    if (!orders) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    return res.json(orders);
  }

  async update(req, res) {
    const { deliveryId } = req.params;

    const order = await Order.findOne({
      where: {
        deliveryman_id: req.params.id,
        id: deliveryId,
      },
    });

    if (!order) {
      return res.status(400).json({ error: 'Order does not exists' });
    }

    const { end_date } = req.body;

    if (end_date) {
      if (order.end_date) {
        return res
          .status(401)
          .json({ error: 'This delivery already have a end date' });
      }

      const signatureExists = await File.findByPk(req.body.signature_id);

      if (!signatureExists) {
        return res
          .status(400)
          .json({ error: 'You have to put your signature on this document' });
      }

      /**
       * Pegar o horário e verificar se ele está entre as 08:00 e 18:00
       * Caso não esteja, retorne um erro.
       */

      const hoursDate = getHours(parseISO(end_date));
      if (hoursDate < 8 || hoursDate > 18) {
        return res.json({
          error: 'You can only do withdrawals between 8am and 6pm',
        });
      }

      /**
       * O entregador só pode fazer 5 retiradas por dia
       */
      const timestampDate = getTime(parseISO(end_date));
      const withdrawal = await Order.findAndCountAll({
        where: {
          deliveryman_id: req.params.id,
          end_date: {
            [Op.between]: [startOfDay(timestampDate), endOfDay(timestampDate)],
          },
        },
      });

      if (withdrawal.count >= 5) {
        return res
          .status(401)
          .json({ error: 'You already did your 5 withdrawals today' });
      }
    }

    await order.update(req.body);
    return res.json(order);
  }
}

export default new DeliveryController();
