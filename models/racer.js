var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RacerSchema = new Schema({
    name:       { type: String },
    season:     { type: Schema.Types.ObjectId, ref: 'Season', default: null },
    results:    [{ type: Schema.Types.ObjectId, ref: 'Result', default: [] }]
});

// Export Models
module.exports = mongoose.model('Racer', RacerSchema);