const helpers = require('../../../app/models/helpers');

describe('cde/activeAlerts', () => {
  describe('When an offender several active alerts', () => {
    let input = {
      nomsId: "A5465AA",
      offenderId: 1014520,

      alerts: [
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "V",
          alertCode: { code: "VOP" },
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "R",
          alertCode: { code: "RCS" },
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "S",
          alertCode: { code: "SR" },
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TPR" },
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TAP" },
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TSE" },
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TM" },
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TAH" },
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: { code: "TG" },
          alertStatus: "ACTIVE"
        }
      ],
    };

    it('Should get all active alerts', () => {
      helpers.getActiveAlerts(input).length.should.equal(9);
    });

    it('Should map all check hold alerts', () => {
      let result = helpers.getCheckHoldAlerts({
        activeAlerts: helpers.getActiveAlerts(input),
      });

      result.should.have.property('T_TG', 'T-TG');
      result.should.have.property('T_TAH', 'T-TAH');
      result.should.have.property('T_TSE', 'T-TSE');
      result.should.have.property('T_TM', 'T-TM');
      result.should.have.property('T_TPR', 'T-TPR');
      result.should.not.have.property('H_HA');
      result.should.have.property('VUL', 'Y');
      result.should.have.property('V_45_46', 'Y');
      result.should.have.property('SH_STS', 'N');
      result.should.not.have.property('SH_Date');
    });
  });

  describe('When an offender has a vulnerable type alert', () => {
    let input = {
      activeAlerts: [
        { alertType: "V" },
      ],
    };

    it('Should flag as vulnerable', () => {
      let result = helpers.getCheckHoldAlerts(input);

      result.should.have.property('VUL', 'Y');
    });
  });

  describe('When an offender does not have a vulnerable type alert', () => {
    let input = {
      activeAlerts: [
        { alertType: "T" },
      ],
    };

    it('Should not flag as vulnerable', () => {
      let result = helpers.getCheckHoldAlerts(input);

      result.should.have.property('V_45_46', 'N');
      result.should.have.property('VUL', 'N');
    });
  });

  describe('When an offender has one of the V_45_46 vulnerable alert codes', () => {
    let input = {
      activeAlerts: [
        { alertType: "V", alertCode: { code: "VOP" } },
      ],
    };

    it('Should flag the rule 45 (yoi rule 46) flag', () => {
      let result = helpers.getCheckHoldAlerts(input);

      result.should.have.property('V_45_46', 'Y');
    });
  });

  describe('When an offender has a vunerable alert but not one of the V_45_46 vulnerable alert codes', () => {
    let input = {
      activeAlerts: [
        { alertType: "V", alertCode: { code: "VVV" } },
      ],
    };

    it('Should not flag the rule 45 (yoi rule 46) flag', () => {
      let result = helpers.getCheckHoldAlerts(input);

      result.should.have.property('V_45_46', 'N');
    });
  });
});
