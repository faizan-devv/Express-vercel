const BaseService = require('./baseService');
const { BadRequestError } = require('../utils/errorTypes');

class TeamsService extends BaseService {
  constructor(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack) {
    super(models, sequelize, apiKey, apiBaseUrl, clientBaseUrl, slack);
  }
  checkUserduplicatesExist = (users) => {
    const userIdCounts = {};
    for (const user of users) {
      if (!userIdCounts[user.ID]) {
        userIdCounts[user.ID] = 0;
      }
      userIdCounts[user.ID] += 1;
      if (userIdCounts[user.ID] > 1) {
        return true;
      }
    }
    return false;
  };
  createTeam = async ({ name, companyId, users, userId }) => {
    const teamData = await this.models.teams.findOne({
      where: {
        Name: name,
        IsDeleted: false,
      },
    });
    if (teamData) {
      throw new BadRequestError('Team with this name already exists');
    }
    if (this.checkUserduplicatesExist(users)) {
      throw new BadRequestError(
        'Same team member can not be added more than once'
      );
    }
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      const team = await this.models.teams.create(
        {
          Name: name,
          CreatedBy: userId,
          CreatedDate: currentDate,
          CompanyID: companyId,
        },
        { transaction: t }
      );
      const sequelizeTeamMembersBulkData = [];
      const userIdList = [];
      for (const user of users) {
        sequelizeTeamMembersBulkData.push({
          TeamID: parseInt(team.ID),
          UserID: parseInt(user.ID),
          CreatedDate: currentDate,
          CreatedBy: userId,
        });
        userIdList.push(parseInt(user.ID));
      }
      const userwithNamesData = await this.models.users.findAll({
        attributes: ['ID', 'Name', 'EmailAddress'],
        where: {
          ID: userIdList,
          CompanyID: companyId,
        },
      });
      const keyMapList = [];
      for (const user of userwithNamesData) {
        keyMapList.push({
          UserID: parseInt(user.ID),
          UserName: user.Name,
          TeamID: parseInt(team.ID),
          TeamName: name,
          Email: user.EmailAddress,
        });
      }
      await this.models.teamMembers.bulkCreate(sequelizeTeamMembersBulkData, {
        transaction: t,
      });
      await this.createNotification(3, keyMapList, 'Added to a Team');
    });
    return {
      success: true,
    };
  };
  fetchTeam = async ({ teamId }) => {
    const teams = await this.models.teams.findOne({
      include: [
        {
          attributes: ['ID', 'TeamID', 'UserID'],
          model: this.models.teamMembers,
          include: [
            {
              attributes: ['ID', 'Name', 'EmailAddress', 'PictureURL'],
              model: this.models.users,
              where: {
                IsDeleted: false,
                IsVerified: true,
              },
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        ID: parseInt(teamId),
        IsDeleted: false,
      },
    });
    return {
      teams,
      success: true,
    };
  };
  fetchAllTeams = async ({ companyId }) => {
    const teams = await this.models.teams.findAll({
      include: [
        {
          required: false,
          attributes: ['ID', 'TeamID', 'UserID'],
          model: this.models.teamMembers,
          include: [
            {
              attributes: ['ID', 'Name', 'EmailAddress', 'PictureURL'],
              model: this.models.users,
              where: {
                IsDeleted: false,
                IsVerified: true,
              },
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        CompanyID: parseInt(companyId),
        IsDeleted: false,
      },
    });
    return {
      teams,
      success: true,
    };
  };
  updateTeam = async ({ teamId, teamName, users, userId, deletedUsers }) => {
    if (this.checkUserduplicatesExist(users)) {
      throw new BadRequestError(
        'Same team member can not be added more than once'
      );
    }
    const deletingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    await this.sequelize.transaction(async (t) => {
      const currentDate = Date.now();
      await this.models.teams.update(
        {
          Name: teamName,
          ModifiedDate: currentDate,
          ModifiedBy: userId,
        },
        {
          where: { ID: teamId },
          transaction: t,
        }
      );
      const oldTeamMembersIDs = [];
      const teamMembers = await this.models.teamMembers.findAll({
        attributes: ['UserID'],
        include: [
          {
            model: this.models.users,
            where: {
              IsDeleted: false,
            },
          },
        ],
        where: {
          TeamID: teamId,
          IsDeleted: false,
        },
      });
      for (const member of teamMembers) {
        oldTeamMembersIDs.push(parseInt(member.UserID));
      }
      if (deletedUsers.length > 0) {
        await this.models.teamMembers.destroy({
          where: {
            UserID: deletedUsers,
          },
          transaction: t,
        });
      }
      const selectedUserIds = [];
      for (const member of users) {
        selectedUserIds.push(member.ID);
      }
      const selectedMembersData = await this.models.users.findAll({
        attributes: ['ID', 'Name', 'EmailAddress'],
        where: {
          ID: selectedUserIds,
        },
      });
      const deletedMembersData = await this.models.users.findAll({
        attributes: ['ID', 'Name', 'EmailAddress'],
        where: {
          ID: deletedUsers,
        },
      });
      const keyMapListDeleted = [];
      for (const member of deletedMembersData) {
        keyMapListDeleted.push({
          UserID: parseInt(member.ID),
          UserName: deletingUser.Name,
          TeamName: teamName,
          Email: member.EmailAddress,
        });
      }
      const sequelizeTeamMembersBulkData = [];
      const keyMapListAdded = [];
      for (const user of users) {
        if (!oldTeamMembersIDs.includes(parseInt(user.ID))) {
          sequelizeTeamMembersBulkData.push({
            TeamID: parseInt(teamId),
            UserID: parseInt(user.ID),
            CreatedDate: currentDate,
            CreatedBy: userId,
          });
          const selectedMember = selectedMembersData.find(
            (member) => parseInt(member.ID) === parseInt(user.ID)
          );
          keyMapListAdded.push({
            UserID: parseInt(user.ID),
            UserName: deletingUser.Name,
            TeamName: teamName,
            Email: selectedMember.EmailAddress,
          });
        }
      }
      await this.models.teamMembers.bulkCreate(sequelizeTeamMembersBulkData, {
        transaction: t,
      });
      if (keyMapListDeleted.length > 0) {
        await this.createNotification(
          3,
          keyMapListDeleted,
          'Removed from a Team'
        );
      }
      if (keyMapListAdded.length > 0) {
        await this.createNotification(3, keyMapListAdded, 'Added to a Team');
      }
    });
    return {
      success: true,
    };
  };
  deleteTeam = async ({ teamId, userId }) => {
    const deletingUser = await this.models.users.findOne({
      where: {
        ID: userId,
      },
    });
    const teamData = await this.models.teams.findOne({
      include: [
        {
          model: this.models.teamMembers,
          include: [
            {
              attributes: ['ID', 'EmailAddress'],
              model: this.models.users,
            },
          ],
          where: {
            IsDeleted: false,
          },
        },
      ],
      where: {
        ID: parseInt(teamId),
      },
    });
    if (!teamData) {
      return new BadRequestError('team does not exist');
    }
    await this.models.teams.update(
      {
        IsDeleted: true,
        ModifiedDate: Date.now(),
        ModifiedBy: userId,
      },
      {
        where: {
          ID: parseInt(teamId),
        },
      }
    );
    const keyMapList = [];
    for (const member of teamData.TeamMembers) {
      keyMapList.push({
        UserID: parseInt(member.User.ID),
        UserName: deletingUser.Name,
        TeamID: parseInt(teamData.ID),
        TeamName: teamData.Name,
        Email: member.User.EmailAddress,
      });
    }
    await this.createNotification(3, keyMapList, 'Team was deleted');
    return {
      success: true,
    };
  };
}

module.exports = TeamsService;
