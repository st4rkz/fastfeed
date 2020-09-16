import Deliverymen from '../models/Deliverymen';
import File from '../models/File';

class DeliverymenController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverymen = await Deliverymen.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const { email } = req.body;

    const deliverymenExists = await Deliverymen.findOne({
      where: {
        email,
      },
    });

    if (deliverymenExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { name, avatar_id } = await Deliverymen.create(req.body);
    return res.json({ name, email, avatar_id });
  }

  async update(req, res) {
    const { id } = req.params;
    const { email } = req.body;
    const deliverymen = await Deliverymen.findByPk(id);

    if (!deliverymen) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const emailExists = await Deliverymen.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }

    const { name, avatar_id } = await deliverymen.update(req.body);

    return res.json({ name, email, avatar_id });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliverymen = await Deliverymen.findByPk(id);

    if (!deliverymen) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    await deliverymen.destroy();
    return res.json();
  }
}

export default new DeliverymenController();
