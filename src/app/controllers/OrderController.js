import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Order from '../models/Order';
import Deliveryman from '../models/Deliverymen';
import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
      },
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
    });
    return res.json(orders);
  }

  async store(req, res) {
    const { deliveryman_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.create(req.body);

    /**
     * Sending email to deliveryman
     */

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda cadastrada',
      template: 'order',
      context: {
        provider: deliveryman.name,
        product,
        date: format(order.createdAt, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json(order);
  }
}

export default new OrderController();
