/**
 * @alias bullComboPopulate
 * @author Felipe Pupo Rodrigues
 * @classDescription classe para popular os option de um combo
 */
bullComboPopulate = new Class({
	Implements: Options,
	options:{
		url:null,
		combo:null,
		affect:null,
		notification:{
			option:'option',
			waiting:'Carregando...',
			ready:'Selecione',
			fail:'Erro, tente novamente.'
		},
		populate:null,
		listener:null
	},
	initialize: function(combo,options){
		this.options.combo = $(combo);
		this.setOptions(options);

		this.request = new Request.JSON({
			url:this.options.url,
			method:'get',
			secure :false,
			noCache:true,
			onRequest:this._onRequest.bind(this),
			onSuccess:this._onSuccess.bind(this),
			onFailure:this._onFailure.bind(this),
			onCancel:this._onCancel.bind(this)
		});
		
		var populateCombo = this;
		this.options.combo.addEvent('change',function(e){
			populateCombo.request.cancel();
			
			if(populateCombo.options.listener)
			{
				var req = populateCombo.options.listener.call(this,populateCombo,e);
			}
			else
			{
				var req = 'value=' + this.get('value');
			}
			
			populateCombo.send(req);
		});
	},
	
	/**
	 * 
	 */
	send: function(param){
		this.request.send(param);
	},
	
	/**
	 * 
	 */
	_onRequest: function(){
		var combo = this.options.affect;
		var notify = this.options.notification;
		var option = combo.getElement(notify.option);
		
		combo.disabled = true;
		combo.setProperty('disabled','disable');
		option.set('text',notify.waiting);
		
		combo.getElements('option').each(function(x,y){
			if(x !== option)
				x.destroy();
		});
	},
	
	/**
	 * 
	 */
	_onSuccess: function(obj,text){
		if(obj){
			obj = JSON.decode(text);
		}
		
		var combo = this.options.affect;
		var notify = this.options.notification;
		var option = combo.getElement(notify.option);
		var options = [];
				
		if(this.options.populate){
			obj = {populate:{objects:null}};
			obj.populate.objects = this.options.populate.bind(this,[text,obj]);
		}
		else if(obj && obj.populate){
			if(obj.populate.status == 'error' || obj.populate.status == false || !obj.populate.objects){
				this._onFailure();
				return;
			}
		}else{
			obj = {populate:{objects:null}};
		}
		
		obj.populate.objects.each(function(x,y){
			options.push(new Element('option',{
				'value':x.value,
				'title':x.title,
				'text':x.text
			}));
		});
		
		options.each(function(o,i){
			o.inject(combo);
		});
		
		combo.disabled = false;
		combo.removeProperty('disabled');
		option.set('text',notify.ready);
	},
	
	/**
	 * 
	 */
	_onFailure: function(){
		var combo = this.options.affect;
		var notify = this.options.notification;
		var option = combo.getElement(notify.option);
		
		option.set('text',notify.fail);
	},
	
	/**
	 * 
	 */
	_onCancel: function(){
		var combo = this.options.affect;
		var notify = this.options.notification;
		var option = combo.getElement(notify.option);
		
		combo.disabled = true;
		combo.setProperty('disabled','disable');
	}
});