const { relations } = require("drizzle-orm/relations");
const { criminalIndictments, criminalEvidence, criminals } = require("./schema");

const criminalEvidenceRelations = relations(criminalEvidence, ({one}) => ({
	criminalIndictment: one(criminalIndictments, {
		fields: [criminalEvidence.indictment_id],
		references: [criminalIndictments.id]
	}),
}));

const criminalIndictmentsRelations = relations(criminalIndictments, ({one, many}) => ({
	criminalEvidences: many(criminalEvidence),
	criminal: one(criminals, {
		fields: [criminalIndictments.criminal_id],
		references: [criminals.id]
	}),
}));

const criminalsRelations = relations(criminals, ({many}) => ({
	criminalIndictments: many(criminalIndictments),
}));

module.exports = {
	criminalEvidenceRelations,
	criminalIndictmentsRelations,
	criminalsRelations
};