class CountriesService {
  constructor(models, sequelize) {
    this.models = models;
    this.sequelize = sequelize;
  }
  loadDropDowns = async () => {
    await this.models.countries.findAll({
      attributes: ['Name'],
      include: [
        {
          model: this.models.states,
          attributes: ['Name'],
          include: [
            {
              model: this.models.cities,
              attributes: ['Name'],
            },
          ],
        },
      ],
    });
    return {
      success: true,
    };
  };
}

module.exports = CountriesService;
