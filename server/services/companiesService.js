const { BadRequestError } = require('../utils/errorTypes');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { verfiyURL } = require('./utils/verifyHelpers');
const { Op } = require('sequelize');
const { getEmailBody } = require('./utils/emailTemplateSelector');
const sgMail = require('@sendgrid/mail');
const { literal } = require('sequelize');
const {
  fetchUpdatedCard,
  updateSubscription,
  stripeWebHook,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  updateSubscriptionCard,
} = require('./thirdPartyApis/stripeApi');

class CompaniesService {
  constructor(
    models,
    sequelize,
    apiBaseUrl,
    clientBaseUrl,
    senderEmail,
    apiKey
  ) {
    this.models = models;
    this.sequelize = sequelize;
    this.apiBaseUrl = apiBaseUrl;
    this.clientBaseUrl = clientBaseUrl;
    this.senderEmail = senderEmail;
    this.apiKey = apiKey;
  }

  formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  createInvoicePDF = async (
    invoiceId,
    planPrice,
    companyName,
    companyAddress,
    companyEmail,
    companyPhone,
    nextInvoiceDate,
    currentDate,
    planName,
    invoicePath
  ) => {
    return new Promise((resolve) => {
      planPrice = planPrice.toFixed(2);
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
      });
      doc.font('Helvetica');
      let posY = 30;
      let posX = 30;
      const output = fs.createWriteStream(invoicePath);
      doc.pipe(output);

      /////// First part: Header //////////
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFF'); // White background
      doc.fillColor('blue').fontSize(22);
      doc.text('INVOICE', undefined, undefined); // INVOICE Text on left
      doc.fillColor('black').fontSize(18);
      doc.text(`$ ${planPrice}`, 505, posY, {
        align: 'right',
        lineBreak: true,
      });
      posY += 30;
      doc.fillColor('black').fontSize(11);
      doc.text(`# ${invoiceId}`, posX, posY, { align: 'left' }); // Invoice number below INVOICE Text
      doc.fillColor('black').fontSize(11);
      doc.text(`Paid on: ${currentDate}`, 400, posY, {
        align: 'right',
        lineBreak: true,
      });
      posY += 20;
      doc
        .moveTo(posX, posY)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY)
        .stroke('lightgrey');
      ///////// Second part: Company Information /////////////
      posY += 20;
      doc.fillColor('blue').fontSize(12);
      doc.text('DevNatives Technologies   NTN:2467818-2', posX, posY);
      doc.image('./server/assets/public/dn-logo-2.png', 490, posY - 5, {
        height: 75,
        width: 75,
        align: 'right',
      });
      posY += 20;
      doc.fillColor('black').fontSize(9);
      doc.text('123 Street Address, I9, Islamabad', posX, posY);
      posY += 15;
      doc.fillColor('black').fontSize(9);
      doc.text('Islamabad, 44000', posX, posY);
      posY += 15;
      doc.fillColor('black').fontSize(9);
      doc.text('info@devnatives.com', posX, posY);
      posY += 15;
      doc.fillColor('black').fontSize(9);
      doc.text('+ 92 51 5423678', posX, posY);
      posY += 40;

      ///////// Third part: Bill To Information /////////////
      doc.rect(posX, posY, doc.page.width - posX * 2, 300).fill('#FAFAFA');
      doc.fillColor('blue').fontSize(12);
      doc.text('Bill To', posX + 5, posY + 5);
      posY += 20;
      doc
        .moveTo(posX, posY)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY)
        .stroke('lightgrey');
      posY += 20;
      doc.fillColor('black').fontSize(9);
      doc.text(`${companyName}`, posX + 5, posY);
      doc.text(`Invoice Date: ${currentDate}`, 459, posY, {
        lineBreak: true,
      });
      posY += 15;
      doc.fillColor('black').fontSize(9);
      doc.text(`${companyAddress}`, posX + 5, posY, { width: 400 });
      doc.text(`Next Invoice Date: ${nextInvoiceDate}`, 440, posY, {
        lineBreak: true,
      });
      posY += 25;
      doc.fillColor('black').fontSize(9);
      doc.text(`${companyEmail}`, posX + 5, posY);
      posY += 15;
      doc.fillColor('black').fontSize(9);
      doc.text(`${companyPhone}`, posX + 5, posY);
      posY += 30;

      ///////// Forth part: Description Information /////////////
      doc.font('Helvetica-Bold').fillColor('black').fontSize(11);
      doc.text('Description', posX + 5, posY);
      doc.text('Total', 536, posY);
      doc.font('Helvetica');
      posY += 15;
      doc
        .moveTo(posX, posY)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY)
        .stroke('lightgrey');
      posY += 13;
      doc.text(`${planName}`, posX + 5, posY);
      doc.text(`$${planPrice}`, 527, posY);
      posY += 20;
      doc
        .moveTo(posX, posY)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY)
        .stroke('lightgrey');
      posY += 15;
      doc.text('Tax@17%: ', posX, posY, {
        align: 'center',
      });
      doc.text('0.00', 540, posY);
      doc
        .moveTo(328, posY + 13)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY + 13)
        .stroke('lightgrey');
      posY += 27;
      doc.text('Total: ', 297, posY);
      doc.text('0.00', 540, posY);
      doc
        .moveTo(328, posY + 13)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY + 13)
        .stroke('lightgrey');
      posY += 27;
      doc.text('Discount: ', 278, posY);
      doc.text('0.00', 540, posY);
      doc
        .moveTo(328, posY + 13)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY + 13)
        .stroke('lightgrey');
      posY += 27;
      doc.text('Grand Total: ', 265, posY);
      doc.text(`$${planPrice}`, 526, posY);
      doc
        .moveTo(328, posY + 13)
        .lineWidth(1)
        .lineTo(doc.page.width - posX, posY + 13)
        .stroke('lightgrey');
      posY += 85;
      doc.font('Helvetica-Bold').fillColor('black').fontSize(12);
      doc.text('Terms and Conditions', posX + 5, posY);
      posY += 20;
      doc.font('Helvetica').fillColor('black').fontSize(11);
      doc.text(
        'By subscribing to our services, you agree to abide by the following terms and conditions. These terms encompass the details of your subscription, including payment, billing, and automatic renewal. Cancellation and refund policies are outlined, and subscribers are responsible for maintaining the security of their accounts. Usage policies, intellectual property rights, and termination conditions are specified, while dispute resolution is subject to negotiation or alternative methods within the jurisdiction of [Your Jurisdiction]. Changes to these terms will be communicated, and users are encouraged to review the accompanying privacy policy. DevNatives retains the right to update these terms, and subscribers acknowledge their understanding and acceptance of these conditions.',
        posX + 5,
        posY
      );
      posY += 210;

      //////// Sixth part: Footer/////////////
      doc.rect(0, posY, doc.page.width, doc.page.height - posY).fill('#0A2B65');
      posY += 15;
      doc.image('./server/assets/public/dn-logo.png', posX, posY, {
        height: 30,
        width: 98,
      });
      doc.image(
        './server/assets/public/invoice-footer.png',
        posX + 300,
        posY + 10,
        {
          height: 22,
          width: 250,
        }
      );
      doc.end();
      output.on('finish', () => {
        output.end();
        resolve();
      });
    });
  };
  sendEmail = async (message) => {
    return new Promise((resolve, reject) => {
      sgMail.setApiKey(this.apiKey);
      sgMail
        .send(message)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  createInvoice = async (doc) => {
    return new Promise((resolve, reject) => {
      try {
        doc.html(`<h1>Hello PDF</h1>`, {
          callback: function (doc) {
            doc.save();
            // access my db
            resolve();
          },
          x: 10,
          y: 10,
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  picturesUnlinker = (pictures) => {
    if (pictures.banner) {
      fs.unlinkSync(path.resolve(pictures.banner[0].path));
    }
    if (pictures.logo) {
      fs.unlinkSync(path.resolve(pictures.logo[0].path));
    }
  };
  setPrimaryLocation = async ({ locationId }) => {
    await this.sequelize.transaction(async (t) => {
      await this.models.companyLocations.update(
        {
          IsPrimary: false,
        },
        {
          where: {},
        },
        { transaction: t }
      );
      await this.models.companyLocations.update(
        {
          IsPrimary: true,
        },
        {
          where: { ID: locationId },
        },
        { transaction: t }
      );
    });
    return {
      success: true,
    };
  };
  editLocation = async (body) => {
    const { locationId } = body;
    const locationEditDate = {
      CompanyID: body.CompanyId,
      AddressLine1: body.AddressLine1,
      AddressLine2: body.AddressLine2,
      CountryID: body.CountryId,
      StateID: body.StateId,
      CityID: body.CityId,
      Zip: body.ZipCode,
      Phone: body.Phone,
      ModifiedBy: body.UserId,
      ModifiedDate: Date.now(),
    };

    await this.models.companyLocations.update(locationEditDate, {
      where: {
        ID: locationId,
      },
    });
    return {
      success: true,
    };
  };
  fetchLocations = async ({ companyId }) => {
    const results = await this.models.companyLocations.findAll({
      include: [
        {
          attributes: ['ID', 'Name'],
          model: this.models.cities,
        },
        {
          attributes: ['ID', 'Name'],
          model: this.models.states,
        },
        {
          attributes: ['ID', 'Name'],
          model: this.models.countries,
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    return {
      results,
      success: true,
    };
  };
  deleteLocation = async ({ locationId }) => {
    const updateObject = {
      IsDeleted: true,
    };
    await this.models.companyLocations.update(updateObject, {
      where: {
        ID: locationId,
      },
    });
    return {
      success: true,
    };
  };
  addLocation = async ({
    userId,
    companyId,
    addressLine1,
    addressLine2,
    countryId,
    stateId,
    cityId,
    zipCode,
    phoneNumber,
    isPrimary,
  }) => {
    if (!addressLine1 || !countryId || !stateId || !cityId)
      throw new BadRequestError('one or more required fields are missing');
    const companyLocation = await this.models.companyLocations.findOne({
      where: {
        AddressLine1: addressLine1,
        CompanyID: companyId,
      },
    });
    if (companyLocation)
      throw new BadRequestError(
        'A location with the entered address already exists for this company'
      );
    await this.models.companyLocations.create({
      CompanyID: companyId,
      AddressLine1: addressLine1,
      AddressLine2: addressLine2,
      CountryID: countryId,
      StateID: stateId,
      CityID: cityId,
      Zip: zipCode,
      Phone: phoneNumber,
      CreatedBy: userId,
      CreateDate: Date.now(),
      IsPrimary: isPrimary,
    });
    return {
      success: true,
    };
  };
  fetchPublicCompanyWiseCities = async ({ companyId }) => {
    const cities = await this.models.cities.findAll({
      attributes: ['ID', 'Name'],
      include: [
        {
          attributes: ['ID', 'AddressLine1'],
          model: this.models.companyLocations,
          include: [
            {
              attributes: [],
              model: this.models.jobs,
              where: {
                JobStatusID: 1,
                IsDeleted: false,
                PublishStatusID: 2,
              },
            },
          ],
          where: {
            CompanyID: companyId,
            IsDeleted: false,
          },
        },
      ],
    });
    return {
      cities,
      success: true,
    };
  };
  fetchCompanyDataByName = async ({ companyName }) => {
    const results = await this.models.companies.findOne({
      include: [
        {
          required: false,
          model: this.models.companyLocations,
          include: [
            {
              attributes: ['ID', 'Name'],
              model: this.models.cities,
            },
            {
              attributes: ['ID', 'Name'],
              model: this.models.states,
            },
            {
              attributes: ['ID', 'Name'],
              model: this.models.countries,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
      ],
      required: false,
      where: {
        Name: companyName,
        IsDeleted: false,
      },
    });
    return {
      results,
      success: true,
    };
  };
  fetchCompanyData = async ({ companyId }) => {
    const results = await this.models.companies.findOne({
      include: [
        {
          model: this.models.companyLocations,
          required: false,
          include: [
            {
              attributes: ['ID', 'Name'],
              model: this.models.cities,
            },
            {
              attributes: ['ID', 'Name'],
              model: this.models.states,
            },
            {
              attributes: ['ID', 'Name'],
              model: this.models.countries,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.timezones,
          required: false,
        },
        {
          model: this.models.companyTypes,
          required: false,
        },
      ],
      where: {
        ID: companyId,
      },
    });
    return {
      results,
      success: true,
    };
  };
  updateDetails = async (body, companyPictures) => {
    if (
      !body.Title ||
      !body.TagLine ||
      !body.Name ||
      !body.TimeZoneID ||
      !body.TotalEmployees ||
      !body.CompanyTypeID ||
      !body.OpenPositionView
    ) {
      throw new BadRequestError('required fields are missing');
    }
    if (body.WebsiteURL) {
      if (companyPictures) this.picturesUnlinker(companyPictures);
      throw new BadRequestError('website url of company cannot be changed !');
    }

    if (companyPictures) {
      if (companyPictures.banner) {
        const modifiedBanner = companyPictures.banner[0].filename
          .split(' ')
          .join('');
        body.BannerURL = this.apiBaseUrl + '/api/companies/' + modifiedBanner;
      } else {
        body.BannerURL = body.BannerSavedFileName;
      }
      if (companyPictures.logo) {
        const modifiedlogo = companyPictures.logo[0].filename
          .split(' ')
          .join('');
        body.PictureURL = this.apiBaseUrl + '/api/companies/' + modifiedlogo;
      } else {
        body.PictureURL = body.LogoSavedFileName;
      }
    } else {
      body.BannerURL = body.BannerSavedFileName;
      body.PictureURL = body.LogoSavedFileName;
    }
    await this.sequelize.transaction(async (t) => {
      if (body.CompanyTypeID === 'null') {
        body.CompanyTypeID = null;
      }
      if (body.YearFounded === 'null') {
        body.YearFounded = null;
      }
      if (body.TimeZoneID) {
        body.TimeZoneID = parseInt(body.TimeZoneID);
      }
      body.CompanyURL = body.Name.replace(/ /g, '-');
      await this.models.companies.update(
        body,
        {
          where: { ID: parseInt(body.ID) },
        },
        { transaction: t }
      );
    });
    return {
      success: true,
    };
  };
  checkStageduplicatesExist = (stages) => {
    const stageNamesCounts = {};
    for (const stage of stages) {
      if (!stageNamesCounts[stage.Name]) {
        stageNamesCounts[stage.Name] = 0;
      }
      stageNamesCounts[stage.Name] += 1;
      if (stageNamesCounts[stage.Name] > 1) {
        return true;
      }
    }
    return false;
  };
  createPipeline = async ({
    pipelineName,
    description,
    createdBy,
    pipelineTypeId,
    companyId,
    stages,
  }) => {
    if (!pipelineName) {
      throw new BadRequestError('pipeline must have a name');
    }
    if (this.checkStageduplicatesExist(stages)) {
      throw new BadRequestError('stage names can not be same in a pipeline');
    }
    const StageNames = [];
    for (const stage of stages) {
      StageNames.push(stage.Name);
    }
    if (!StageNames.includes('Missing Stage')) {
      const missingStageObject = {
        Name: 'Missing Stage',
        CreatedBy: createdBy,
        description: 'missing stage mandatory for all pipelines',
      };
      stages.unshift(missingStageObject);
    }
    const pipelineData = await this.models.pipelines.findOne({
      attributes: ['ID', 'CompanyID'],
      where: {
        CompanyID: parseInt(companyId),
        Name: pipelineName,
        IsDeleted: false,
      },
    });
    if (pipelineData) {
      throw new BadRequestError('pipeline with this name already exists');
    }
    await this.sequelize.transaction(async (t) => {
      const pipeline = await this.models.pipelines.create(
        {
          Name: pipelineName,
          CompanyID: companyId,
          CreatedBy: createdBy,
          CreatedDate: Date.now(),
          PipelineTypeID: pipelineTypeId,
          Description: description,
        },
        { transaction: t }
      );
      const bulkStagesData = [];
      let stagesOrder = 0;
      for (const stage of stages) {
        bulkStagesData.push({
          Name: stage.Name,
          StageOrder: stagesOrder,
          PipelineID: pipeline.ID,
          CreatedBy: createdBy,
          CreatedDate: Date.now(),
          Description: stage.description,
        });
        stagesOrder += 1;
      }
      await this.models.stages.bulkCreate(bulkStagesData, {
        transaction: t,
      });
    });
    return {
      success: true,
    };
  };

  copyPipeline = async ({
    pipelineName,
    pipelineId,
    companyId,
    description,
    createdBy,
    pipelineTypeId,
  }) => {
    if (!pipelineName) {
      throw new BadRequestError('pipeline must have a name');
    }
    pipelineName += ' - Copy';
    const pipelineData = await this.models.pipelines.findOne({
      attributes: ['ID', 'CompanyID', 'Name'],
      where: {
        CompanyID: parseInt(companyId),
        Name: pipelineName,
        IsDeleted: false,
      },
    });
    if (pipelineData) {
      throw new BadRequestError('pipeline copy already exists');
    }
    const stagesData = await this.fetchAllPipelineStages({ pipelineId });
    await this.sequelize.transaction(async (t) => {
      const stageNames = [];
      for (const stage of stagesData.results) {
        stageNames.push(stage.Name);
      }
      const pipeline = await this.models.pipelines.create(
        {
          Name: pipelineName,
          CompanyID: companyId,
          CreatedBy: createdBy,
          CreatedDate: Date.now(),
          PipelineTypeID: pipelineTypeId,
          Description: description,
        },
        { transaction: t }
      );
      const bulkStagesData = [];
      let stagesOrder = 0;
      for (const name of stageNames) {
        bulkStagesData.push({
          Name: name,
          StageOrder: stagesOrder,
          PipelineID: pipeline.ID,
          CreatedBy: createdBy,
          CreatedDate: Date.now(),
          Description: '',
        });
        stagesOrder += 1;
      }
      await this.models.stages.bulkCreate(bulkStagesData, {
        transaction: t,
      });
    });
    return {
      success: true,
    };
  };

  updatePipeline = async ({
    pipelineID,
    stages,
    deletedStages,
    updateStages,
    createdBy,
    pipelineName,
    pipelineTypeId,
  }) => {
    if (!pipelineTypeId) {
      throw new BadRequestError('pipelineTypeId is required');
    }
    const pipelineData = await this.models.pipelines.findOne({
      where: {
        ID: pipelineID,
      },
    });
    if (!pipelineData) {
      return new BadRequestError('pipeline does not exist');
    }
    if (this.checkStageduplicatesExist(stages)) {
      throw new BadRequestError('stage names can not be same in a pipeline');
    }
    await this.sequelize.transaction(async (t) => {
      await this.models.pipelines.update(
        { Name: pipelineName },
        {
          where: {
            ID: pipelineID,
          },
          transaction: t,
        }
      );
      if (deletedStages.length > 0) {
        const stagesData = await this.models.stages.findOne({
          attributes: ['ID', 'Name'],
          where: {
            Name: 'Missing Stage',
            PipelineID: pipelineID,
          },
        });
        await this.models.stages.update(
          { IsDeleted: 1 },
          {
            where: {
              ID: deletedStages,
            },
            transaction: t,
          }
        );
        if (pipelineTypeId === 1) {
          await this.models.applications.update(
            { StageID: parseInt(stagesData.ID) },
            {
              where: {
                StageID: deletedStages,
              },
              transaction: t,
            }
          );
        }
        if (pipelineTypeId === 2) {
          await this.models.candidatePools.update(
            { StageID: parseInt(stagesData.ID) },
            {
              where: {
                StageID: deletedStages,
              },
              transaction: t,
            }
          );
        }
      }
      let stagesOrder = 0;
      for (const stage of stages) {
        if (!stage.ID) {
          await this.models.stages.create(
            {
              Name: stage.Name,
              StageOrder: stagesOrder,
              PipelineID: pipelineID,
              CreatedBy: createdBy,
              CreatedDate: Date.now(),
              Description: stage.description,
            },
            {
              transaction: t,
            }
          );
        } else {
          const updateStageObject = { StageOrder: stagesOrder };
          if (updateStages.includes(parseInt(stage.ID))) {
            updateStageObject['Name'] = stage.Name;
          }
          await this.models.stages.update(updateStageObject, {
            where: {
              ID: stage.ID,
            },
            transaction: t,
          });
        }
        stagesOrder += 1;
      }
    });
    return {
      success: true,
    };
  };

  deletePipeline = async ({ pipelineId }) => {
    pipelineId = parseInt(pipelineId);
    const pipelineData = await this.models.pipelines.findOne({
      where: {
        ID: pipelineId,
      },
    });
    if (!pipelineData) {
      return new BadRequestError('pipeline does not exist');
    }
    await this.models.pipelines.update(
      {
        IsDeleted: true,
      },
      {
        where: {
          ID: pipelineId,
        },
      }
    );
    return {
      success: true,
    };
  };

  fetchAllPipelineStages = async ({ pipelineId }) => {
    const results = await this.models.stages.findAll({
      attributes: ['ID', 'Name', 'Description', 'StageOrder'],
      where: {
        PipelineID: parseInt(pipelineId),
        IsDeleted: false,
      },
      order: [['StageOrder', 'ASC']],
    });
    return {
      results,
      success: true,
    };
  };

  fetchAllPipelines = async ({ companyId }) => {
    const results = await this.models.pipelines.findAll({
      attributes: ['ID', 'Name', 'PipelineTypeID'],
      where: {
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      results,
      success: true,
    };
  };

  fetchGenericSearch = async ({ name, companyId }) => {
    const Pools = await this.models.pools.findAll({
      attributes: [['ID', 'PoolID'], 'Name', 'CreatedDate'],
      include: [
        { required: false, model: this.models.categories },
        {
          required: false,
          model: this.models.candidatePools,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        CompanyID: parseInt(companyId),
        Name: { [Op.like]: `%${name}%` },
        IsDeleted: false,
      },
    });
    const Positions = await this.models.jobs.findAll({
      attributes: [
        ['ID', 'JobID'],
        'Title',
        'CreatedDate',
        'LastDate',
        'JobStatusID',
      ],
      include: [
        {
          model: this.models.jobTypes,
        },
        {
          model: this.models.applications,
          where: { IsDeleted: false },
          required: false,
        },
        {
          required: false,
          attributes: ['AddressLine1', 'AddressLine2'],
          model: this.models.companyLocations,
          include: [
            {
              attributes: ['Name'],
              model: this.models.countries,
            },
            {
              attributes: ['Name'],
              model: this.models.cities,
            },
          ],
        },
      ],
      where: {
        CompanyID: parseInt(companyId),
        JobStatusID: [1, 3, 4],
        Title: { [Op.like]: `%${name}%` },
        IsDeleted: false,
      },
    });
    const Applicants = await this.models.applicants.findAll({
      attributes: [
        ['ID', 'ApplicantID'],
        'FullName',
        'CreatedDate',
        'ModifiedDate',
      ],
      include: [
        {
          attributes: ['Name'],
          model: this.models.companies,
        },
        {
          required: false,
          attributes: ['ID', 'CreatedDate', 'ModifiedDate'],
          model: this.models.applications,
          include: [
            {
              attributes: ['Title'],
              model: this.models.jobs,
              include: [
                {
                  attributes: ['ID', 'Name'],
                  model: this.models.pipelines,
                  include: [
                    {
                      attributes: ['Name'],
                      model: this.models.stages,
                    },
                  ],
                },
              ],
              where: {
                IsDeleted: false,
              },
            },
            {
              required: false,
              attributes: ['Name', 'StageOrder'],
              model: this.models.stages,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.candidatePools,
          required: false,
          include: [
            {
              required: false,
              model: this.models.pools,
              include: [
                {
                  attributes: ['ID', 'Name'],
                  model: this.models.pipelines,
                  include: [
                    {
                      model: this.models.stages,
                    },
                  ],
                },
              ],
              where: {
                IsDeleted: false,
              },
            },
            {
              required: false,
              attributes: ['Name', 'StageOrder'],
              model: this.models.stages,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          required: false,
          attributes: ['ID', 'Name', 'DocumentTypeID', 'Path'],
          model: this.models.candidateDocuments,
          where: {
            DocumentTypeID: 4,
            IsDeleted: false,
          },
        },
      ],
      where: {
        CompanyID: parseInt(companyId),
        FullName: { [Op.like]: `%${name}%` },
        IsDeleted: false,
      },
    });
    let unionObject = [...Positions, ...Pools, ...Applicants];
    unionObject = unionObject.sort(
      (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
    );
    unionObject = unionObject.slice(0, 10);
    return {
      unionObject,
      success: true,
    };
  };

  fetchAllPoolAndPositions = async ({ companyId }) => {
    const Pools = await this.models.pools.findAll({
      attributes: ['ID', 'Name'],
      where: {
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    const Positions = await this.models.jobs.findAll({
      attributes: ['ID', 'Title'],
      where: {
        CompanyID: parseInt(companyId),
        JobStatusID: 1,
        IsDeleted: false,
      },
    });
    const PoolsWithTypes = Pools.map((pool) => ({
      Value: pool.ID,
      Name: pool.Name,
      Type: 'pools',
    }));

    const PositionsWithTypes = Positions.map((position) => ({
      Value: position.ID,
      Name: position.Title,
      Type: 'positions',
    }));

    const unionObject = [...PositionsWithTypes, ...PoolsWithTypes];
    return {
      unionObject,
      success: true,
    };
  };

  fetchCompanyBillingData = async ({ companyId }) => {
    const totalCandidates = await this.models.applicants.findAll({
      attributes: ['ID'],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const totalPositions = await this.models.jobs.findAll({
      attributes: ['ID'],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const totalPools = await this.models.pools.findAll({
      attributes: ['ID'],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const totalTeamMembers = await this.models.teamMembers.findAll({
      attributes: ['ID'],
      include: [
        {
          required: true,
          model: this.models.users,
          where: {
            CompanyID: companyId,
            IsDeleted: true,
          },
        },
      ],
      where: {
        IsDeleted: false,
      },
    });
    const remainingCounts = {
      'Active Positions': 0,
      'Candidate Pool': 0,
      'Candidates on Position': 0,
      'Team Members': 0,
    };
    const companyCardsData = await this.models.companyCards.findAll({
      include: [
        {
          model: this.models.cardTypes,
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const companyBillingData = await this.models.companyPricingPlans.findOne({
      include: [
        {
          attributes: ['ID'],
          model: this.models.companies,
          include: [
            {
              required: false,
              model: this.models.companyPaymentHistory,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
        {
          model: this.models.pricingPlans,
          include: [
            {
              attributes: ['BenefitTitle', 'BenefitValue'],
              model: this.models.benefitsPlans,
              where: {
                IsDeleted: false,
              },
            },
            {
              model: this.models.currencies,
            },
            {
              model: this.models.recurrences,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
      order: [
        [
          this.models.companies,
          this.models.companyPaymentHistory,
          'CreatedDate',
          'DESC',
        ],
      ],
    });
    companyBillingData.PricingPlan.BenefitsPlans.forEach((plan) => {
      if (plan.BenefitTitle === 'Active Positions') {
        remainingCounts['Active Positions'] =
          totalPositions.length > parseInt(plan.BenefitValue)
            ? 0
            : parseInt(plan.BenefitValue) - totalPositions.length;
      }
      if (plan.BenefitTitle === 'Max Candidates on Position') {
        remainingCounts['Candidates on Position'] =
          totalCandidates.length > parseInt(plan.BenefitValue)
            ? 0
            : parseInt(plan.BenefitValue) - totalCandidates.length;
      }
      if (plan.BenefitTitle === 'Candidate Pools') {
        remainingCounts['Candidate Pool'] =
          totalPools.length > parseInt(plan.BenefitValue)
            ? 0
            : parseInt(plan.BenefitValue) - totalPools.length;
      }
      if (plan.BenefitTitle === 'Team Members') {
        remainingCounts['Team Members'] =
          totalTeamMembers.length > parseInt(plan.BenefitValue)
            ? 0
            : parseInt(plan.BenefitValue) - totalTeamMembers.length;
      }
    });
    const billingData = {
      companyCardsData,
      companyBillingData,
      remainingCounts,
    };
    return {
      billingData,
      success: true,
    };
  };

  fetchAllPlansAndBenefits = async ({ companyId }) => {
    const plansAndBenefits = await this.models.pricingPlans.findAll({
      include: [
        {
          attributes: ['PricingPlanID', 'CompanyID'],
          required: false,
          model: this.models.companyPricingPlans,
          where: {
            CompanyID: companyId,
          },
        },
        {
          model: this.models.currencies,
        },
        {
          model: this.models.recurrences,
        },
        {
          attributes: ['BenefitTitle', 'BenefitValue'],
          model: this.models.benefitsPlans,
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        IsDeleted: false,
      },
    });
    return {
      plansAndBenefits,
      success: true,
    };
  };

  createCheckoutStripe = async ({ priceId }) => {
    const session = await createCheckoutSession(this.clientBaseUrl, priceId);
    // await this.models.companyPricingPlans.create();
    return {
      session,
      success: true,
    };
  };

  createPortalStripe = async ({ sessionId, companyId, userId }) => {
    const companyPayment = await this.models.companyPaymentHistory.create({
      SessionID: sessionId,
      CompanyID: parseInt(companyId),
      CreateDate: Date.now(),
    });
    const company = await this.models.companies.findOne({
      include: [
        {
          model: this.models.companyLocations,
        },
      ],
      where: {
        ID: companyId,
      },
    });
    const data = await createPortalSession(this.clientBaseUrl, sessionId);
    if (data) {
      const { invoice, url, status, card, subscription } = data;
      const { fingerprint, brand, exp_month, exp_year, last4 } = card;
      const {
        amount_paid,
        billing_reason,
        created,
        currency,
        invoice_pdf,
        id,
        period_start,
        period_end,
      } = invoice;
      const { subscriptionId, plan } = subscription;
      const transactionData = await this.sequelize.transaction(async (t) => {
        const cardType = await this.models.cardTypes.findOne({
          where: {
            [Op.or]: [{ Name: brand }, { Code: brand }],
          },
        });
        const card = await this.models.companyCards.findOne({
          where: {
            FingerPrint: fingerprint,
            CompanyID: companyId,
          },
        });
        if (!card) {
          await this.models.companyCards.create(
            {
              FingerPrint: fingerprint,
              CompanyID: companyId,
              Brand: brand,
              ExpiryMonth: exp_month,
              ExpiryYear: exp_year,
              LastFour: last4,
              CardTypeID: cardType.ID,
            },
            { transaction: t }
          );
        }
        const pricingPlan = await this.models.pricingPlans.findOne({
          where: {
            Title: plan,
          },
        });
        await this.models.companyPricingPlans.update(
          {
            PricingPlanID: pricingPlan.ID,
            StripeSubscriptionID: subscriptionId,
          },
          {
            where: { CompanyID: companyId },
            transaction: t,
          }
        );
        const invoicePath = `./server/assets/companies/${company.Name}-${id}-invoice.pdf`;
        await this.createInvoicePDF(
          id,
          amount_paid / 100,
          company.Name,
          company.CompanyLocations[0].AddressLine1,
          company.EmailAddress,
          '+92-51-3233453',
          this.formatDate(Date.now()),
          this.formatDate(subscription.nextPayment * 1000),
          plan,
          invoicePath
        );

        await this.models.companyPaymentHistory.update(
          {
            Plan: plan,
            Amount: amount_paid,
            FilePath: `${this.apiBaseUrl}/api/companies/${company.Name}-${id}-invoice.pdf`,
            Currency: currency,
            StripeInvoiceID: id,
            BillingReason: billing_reason,
            NextPayment: new Date(subscription.nextPayment * 1000),
          },
          {
            where: { SessionID: sessionId, CompanyID: companyId },
            transaction: t,
          }
        );
        return {
          invoicePath,
        };
      });
      const user = await this.models.users.findOne({
        attributes: ['Name', 'EmailAddress'],
        where: {
          ID: userId,
        },
      });
      const invoiceContent = fs
        .readFileSync(transactionData.invoicePath)
        .toString('base64');
      try {
        sgMail.setApiKey(this.apiKey);
        const message = {
          to: user.EmailAddress,
          from: this.senderEmail,
          subject: 'Successfully Subscribed',
          attachments: [
            {
              content: invoiceContent,
              filename: 'Subscription Invoice',
              type: 'application/pdf',
              disposition: 'attachment',
            },
          ],
          html: getEmailBody(
            'subscriptionCreated',
            this.apiBaseUrl,
            this.clientBaseUrl,
            {
              invoiceUrl: invoice_pdf,
              planTitle: plan,
              userName: user.Name,
            }
          ),
        };
        await this.sendEmail(message);
      } catch (error) {
        throw new BadRequestError('Error while sending email: ' + error);
      }
      return {
        invoice: { id, amount_paid, currency },
        url,
        status,
        success: true,
      };
    } else {
      throw new BadRequestError('no checkout and portal session found');
    }
  };

  deleteSubscription = async ({ companyId, userId }) => {
    const pricingPlan = await this.models.companyPricingPlans.findOne({
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    if (!pricingPlan || !pricingPlan.StripeSubscriptionID) {
      throw new BadRequestError(
        'Company has no subscription currently to cancel'
      );
    }
    await cancelSubscription(pricingPlan.StripeSubscriptionID);
    await this.models.companyPricingPlans.update(
      {
        PricingPlanID: 3,
        StripeSubscriptionID: null,
      },
      {
        where: {
          CompanyID: companyId,
        },
      }
    );
    const user = await this.models.users.findOne({
      attributes: ['Name', 'EmailAddress'],
      where: {
        ID: userId,
      },
    });
    try {
      sgMail.setApiKey(this.apiKey);
      const message = {
        to: user.EmailAddress,
        from: this.senderEmail,
        subject: 'Subscription Cancelled',
        html: getEmailBody(
          'subscriptionCanceled',
          this.apiBaseUrl,
          this.clientBaseUrl,
          {
            userName: user.Name,
            currentDate: Date.now(),
          }
        ),
      };
      await this.sendEmail(message);
    } catch (error) {
      throw new BadRequestError('Error while sending email: ' + error);
    }
    return {
      success: true,
    };
  };
  updatePricingPlan = async ({ pricingPlanId, companyId }) => {
    const subscription = await this.models.companyPricingPlans.findOne({
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const pricingPlan = await this.models.pricingPlans.findOne({
      where: {
        ID: pricingPlanId,
      },
    });
    await updateSubscription(
      subscription.StripeSubscriptionID,
      pricingPlan.StripePlanID
    );
    await this.models.companyPricingPlans.update(
      {
        PricingPlanID: pricingPlanId,
      },
      {
        where: {
          CompanyID: companyId,
        },
      }
    );
    return {
      success: true,
    };
  };

  updateSubscriptionCard = async ({ companyId }) => {
    const pricePlans = await this.models.companyPricingPlans.findOne({
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const session = await updateSubscriptionCard(
      this.clientBaseUrl,
      pricePlans.StripeSubscriptionID
    );
    return {
      sessionId: session.id,
      url: session.url,
      success: true,
    };
  };
  updateCardDataDb = async ({ companyId }) => {
    const pricingPlan = await this.models.companyPricingPlans.findOne({
      attributes: ['StripeSubscriptionID'],
      where: {
        CompanyID: companyId,
        IsDeleted: false,
      },
    });
    const data = await fetchUpdatedCard(pricingPlan.StripeSubscriptionID);
    if (!data || !data?.card) {
      throw new BadRequestError('card data not found for subscription');
    }

    const { fingerprint, brand, exp_month, exp_year, last4 } = data.card;
    const cardType = await this.models.cardTypes.findOne({
      where: {
        [Op.or]: [{ Name: brand }, { Code: brand }],
      },
    });
    await this.models.companyCards.update(
      {
        FingerPrint: fingerprint,
        CompanyID: companyId,
        Brand: brand,
        ExpiryMonth: exp_month,
        ExpiryYear: exp_year,
        LastFour: last4,
        CardTypeID: cardType.ID,
      },
      {
        where: { CompanyID: companyId },
      }
    );
    return {
      success: true,
    };
  };

  webhook = async (req) => {
    const data = await stripeWebHook(req);
    if (data) {
    }
    return {
      description: 'Stripe webhook success',
      success: true,
    };
  };

  fetchCompanyPlanRights = async ({ companyId }) => {
    const companyPlan = await this.models.companyPricingPlans.findAll({
      attributes: [],
      include: [
        {
          model: this.models.pricingPlans,
          attributes: ['Title', 'Description'],
          include: [
            {
              model: this.models.benefitsPlans,
              attributes: ['BenefitTitle', 'BenefitValue'],
              where: {
                IsDeleted: 0,
              },
            },
          ],
          where: {
            IsDeleted: 0,
          },
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: 0,
      },
    });
    return {
      companyPlan,
      success: true,
    };
  };
  fetchCompanyModuleRightsPerPlan = async ({
    companyId,
    moduleName,
    jobId,
  }) => {
    const benefits = await this.models.companyPricingPlans.findAll({
      attributes: [],
      include: [
        {
          model: this.models.pricingPlans,
          attributes: [],
          include: [
            {
              model: this.models.benefitsPlans,
              attributes: ['BenefitTitle', 'BenefitValue'],
              where: { BenefitTitle: moduleName },
            },
          ],
        },
      ],
      where: {
        CompanyID: companyId,
        IsDeleted: 0,
      },
      raw: true,
    });
    let isAllowEntry = false;
    let totalCandidates = 0;
    let totalActivePositions = 0;
    let totalpools = 0;
    let totalusers = 0;
    if (benefits[0]['PricingPlan.BenefitsPlans.BenefitValue'] === 'unlimited') {
      isAllowEntry = true;
      return {
        isAllowEntry,
        success: true,
      };
    }

    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] ===
      'Max Candidates on Position'
    ) {
      totalCandidates = await this.models.applicants.count({
        include: [
          {
            model: this.models.applications,
            where: {
              IsDeleted: 0,
              JobID: jobId,
            },
            required: true,
          },
        ],
        where: {
          CompanyID: companyId,
          IsDeleted: 0,
        },
      });
      if (
        totalCandidates < benefits[0]['PricingPlan.BenefitsPlans.BenefitValue']
      ) {
        isAllowEntry = true;
      }
    }
    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] === 'Max Candidates'
    ) {
      totalCandidates = await this.models.applicants.count({
        where: {
          CompanyID: companyId,
          IsDeleted: 0,
        },
      });
      if (
        totalCandidates < benefits[0]['PricingPlan.BenefitsPlans.BenefitValue']
      ) {
        isAllowEntry = true;
      }
    }
    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] ===
      'Active Positions'
    ) {
      totalActivePositions = await this.models.jobs.count({
        where: {
          IsActive: 1,
          IsDeleted: 0,
          CompanyID: companyId,
        },
      });
      if (
        totalActivePositions <
        benefits[0]['PricingPlan.BenefitsPlans.BenefitValue']
      ) {
        isAllowEntry = true;
      }
    }
    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] ===
      'Candidate Pools'
    ) {
      totalpools = await this.models.pools.count({
        where: {
          IsDeleted: 0,
          CompanyID: companyId,
        },
      });
      if (totalpools < benefits[0]['PricingPlan.BenefitsPlans.BenefitValue']) {
        isAllowEntry = true;
      }
    }
    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] === 'Team Members'
    ) {
      totalusers = await this.models.users.count({
        where: {
          IsDeleted: 0,
          CompanyID: companyId,
        },
      });
      if (totalusers < benefits[0]['PricingPlan.BenefitsPlans.BenefitValue']) {
        isAllowEntry = true;
      }
    }
    if (
      benefits[0]['PricingPlan.BenefitsPlans.BenefitTitle'] ===
        'Resume Parsing' &&
      benefits[0]['PricingPlan.BenefitsPlans.BenefitValue'] === 'Available'
    ) {
      isAllowEntry = true;
    }
    const companyPlan = benefits;
    return {
      isAllowEntry,
      success: true,
    };
  };

  fetchFeedbackQuestions = async () => {
    const companyFeedbackQuestion = await this.models.feedBackQuestions.findAll(
      {
        include: [
          {
            model: this.models.feedBackQuestions,
            as: 'SubQuestions',
          },
          {
            model: this.models.feedBackQuestionType,
          },
        ],
        where: {
          ParentFeedBackQuestionID: null,
        },
      }
    );

    return {
      companyFeedbackQuestion,
      success: true,
    };
  };
  createFeedbackAnswers = async ({ Answers }) => {
    await this.sequelize.transaction(async (t) => {
      const bulkAnswersData = [];

      for (const answer of Answers) {
        bulkAnswersData.push({
          QuestionID: answer.QuestionID,
          Answer: answer.Answer.toString(),
          CompanyPricingPlansID: answer.CompanyPricingPlansID,
          CompanyID: answer.CompanyID,
          CreatedBy: answer.CreatedBy,
          CreatedDatetime: Date.now(),
        });
      }

      await this.models.feedBackQuestionsAnswers.bulkCreate(bulkAnswersData, {
        transaction: t,
      });
    });
    return {
      success: true,
    };
  };
}
module.exports = CompaniesService;
