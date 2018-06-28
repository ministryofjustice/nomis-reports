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
          alertCode: "VOP",
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "R",
          alertCode: "RCS",
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "S",
          alertCode: "SR",
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TPR",
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TAP",
          alertStatus: "ACTIVE",
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TSE",
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TM",
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TAH",
          alertStatus: "ACTIVE"
        },
        {
          bookingId: 15711,
          alertDate: "2010-04-12",
          alertType: "T",
          alertCode: "TG",
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
      result.should.have.property('V_45_46', 'Y');
      result.should.have.property('VUL', 'N');
      result.should.have.property('SH_STS', 'N');
      result.should.not.have.property('SH_Date');
    });
  });
});
