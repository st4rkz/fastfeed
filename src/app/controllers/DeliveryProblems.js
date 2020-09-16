import Order from '../models/Order';
import Deliverymen from '../models/Deliverymen';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryProblems {
  async index(req, res) {
    // const { id } = req.params;

    return res.json();
  }

  async store(req, res) {
    const { id } = req.params;

    const order = await Order.findOne({ where: { id } });
    if (!order) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const { delivery_id, description } = req.body;

    const problem = await DeliveryProblem.create(req.body);

    return res.json(order);
  }
}

export default new DeliveryProblems();
