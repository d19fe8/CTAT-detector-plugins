//Fake example of a detector.  Receives transaction data from
//mailer.  Sends detector results to mailer.

var mailer;

function receive_transaction( e ){
	//e is the data of the transaction from mailer from transaction assembler
	console.log("in detector1 with data = ", e.data);
	var d = new Date();
	var id = (e.data ? e.data.transaction_id : null);
  output_data = { time: d, transaction_id: id, name: 'detector1', category: 'category1', value: 0, history: "", skill_names: ["Distribute/LDashb", "Combine_constant_terms/LDashb"]};
  console.log("output_data = ", output_data);
  mailer.postMessage(output_data);
}

self.onmessage = function ( e ) {
    console.log("detector1 self.onmessage:", e, e.data, (e.data?e.data.commmand:null), (e.data?e.data.transaction:null), e.ports);
    switch( e.data.command )
    {
    case "connectMailer":
	mailer = e.ports[0];
	mailer.onmessage = receive_transaction;
	break;
    default:
	break;
    }
}

//Fake detector results to send to mailer
setInterval(function(){

},6000);
