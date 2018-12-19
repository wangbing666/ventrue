 function validForm(obj) {
 	if (obj.name && obj.moblie && obj.code && obj.company && obj.job && obj.wechat && obj.city ) {
 		if (obj.selectedIdentity == 0 && (typeof domain !='undefinded')) {
 			return true
 		}else if (obj.selectedIdentity == 1 && obj.selectInvArea.length > 0 && obj.selectInvFinance.length > 0 && obj.invCase) {
 			return true
 		}else if (obj.selectedIdentity == 3 && obj.selectedService.length > 0) {
 			return true
 		};
 	}
 	return false
}

module.exports = {

}
