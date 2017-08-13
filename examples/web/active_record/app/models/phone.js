var Base = ActiveRecord.Base;
module.exports = Phone;
Base.extend(Phone, Base);
function Phone (attributes){
	this.initialize(attributes);
	this.validate_presence_of('number');
	this.validate_presence_of('user_id');
	this.validate_length_of('number', { is: 10 });
}
Phone.belongs_to('user');
