/**
 * Aloha.FontSize
 * The Font Size allows the change of font size of text
 * Author: Jeremy Strouse (jstrouse@strouseconsulting.com)
 * Update for Aloha 0.22: Tomas Molnar (molnar@mediacube.sk) 
 * This is in parts based on the Aloha characterpicker plugin and other plugins
 * such as the colorselector plugin and previous version plugins by RecessMobile
 */

define(
[ 'aloha/jquery',
	'aloha/plugin',
	'ui/ui',
	'ui/button',
	'i18n!fontsize/nls/i18n',
	'i18n!aloha/nls/i18n',
  'css!fontsize/css/fontsize.css'],
function (jQuery, Plugin, Ui, Button, i18n, i18nCore){
    "use strict";
		
		var Aloha = window.Aloha;
   
	 return Plugin.create( 'fontsize', {
      _constructor: function(){
					this._super('fontsize');
				},
			languages: ['en'],
			config: [ 'fontsize' ], //If not defined otherwise, the plugin is available
      init: function() {
				this.createButtons();
				var that = this;
				
				//Change your code in the init function
				Aloha.bind("aloha-editable-activated", function (jEvent, aEvent) {
					var config = that.getEditableConfig( Aloha.activeEditable.obj );
					if (jQuery.type(config) === 'array' && jQuery.inArray( 'fontsize', config ) !== -1) {
						that._fontSizeButtonUp.show(true);
						that._fontSizeButtonDown.show(true);
					} else {
						that._fontSizeButtonUp.show(false);
						that._fontSizeButtonDown.show(false);
						return;
					}
				});
			},
			createButtons: function(){
				var that = this;
				//We tell the UI to adopt our button in the position "toggleMetaView"
				//and derive it from "Button"
				this._fontSizeButtonUp = Ui.adopt("FontSizeUp", Button, {
					tooltip : 'Increase Font Size',//i18n.t('button.switch-fontsizeup.tooltip'),
					icon: 'aloha-icon aloha-icon-fontsizeup',
					scope: 'Aloha.continuoustext',
					click : function () { that.buttonUpClick();  }
				});
				this._fontSizeButtonDown = Ui.adopt("FontSizeDown", Button, {
					tooltip : 'Decrease Font Size',//i18n.t('button.switch-fontsizedown.tooltip'),
					icon: 'aloha-icon aloha-icon-fontsizedown',
					scope: 'Aloha.continuoustext',
					click : function () { that.buttonDownClick();  }
				});

			},
			buttonUpClick: function(){
				//alert('fontsize up clicked');
				this.applyCss(0);
				
			},
			buttonDownClick: function(){
				//alert('fontsize down clicked');
				this.applyCss(1);
			},
			applyCss: function(index){
				if (Aloha.activeEditable) {
					//Aloha.activeEditable.obj[0].focus()
				}
	
				var newSize;
				var markup = jQuery('<span class="aloha"></span>');
				var rangeObject = Aloha.Selection.getRangeObject();
				var parents = Aloha.Selection.getSelectionTree();
				var count = 0;
				var partialreplace = false;
				
				// Loop through all matching markup sections and apply the new CSS
				for (var i = 0; i < parents.length; i++) {
					if (parents[i].selection.toLowerCase() == "full") {
						count = 0;
						jQuery(parents[i].domobj).find('span').each(function () {
							count += 1;
							newSize = (parseInt(jQuery(this).css('font-size')) + (index === 0?1:-1)) + 'px';
							jQuery(this).css('font-size',newSize);
						});
						if (count == 0 && parents.length == 1) {
							// Maybe we just selected the actual element, so check it's parent
							jQuery(parents[i].domobj).parent().each(function() { 
								if (this.nodeName.toLowerCase() == 'span') {
									count += 1;
				newSize = (parseInt(jQuery(this).css('font-size')) + (index === 0?1:-1)) + 'px';
									jQuery(this).css('font-size',newSize);
								};
							});
						}
						if (count == 0 || (parents[i].domobj.tagName && parents[i].domobj.tagName.toLowerCase() != 'span')) {
							if (parents[i].domobj.nodeType == 3)
								jQuery(parents[i].domobj).wrap(markup);
							else
								jQuery(parents[i].domobj).wrapInner(markup);
						}
					}
					else if (parents[i].selection.toLowerCase() == "partial") {
						partialreplace = true;
						console.log('replace partial');
						this.replaceChild(parents[i],index)
					}
				};
	
				// Trigger undo point!
				Aloha.activeEditable.smartContentChange( { type : 'blur' }, null );
	
				// TODO - Figure out why the range selection is changing sometimes
	
				// Throws errors if we've added a tag in the middle, so skip it
				// instead of having it error
				if (! partialreplace)
					rangeObject.select();
				return false;
			},
			replaceChild: function(item,index) {
				 if (item.domobj.nodeType == 3) {
            var newSize = (parseInt(jQuery(item.domobj.parentNode).css('font-size')) + (index === 0?1:-1)) + 'px';
						var text = item.domobj.data.substr(item.startOffset, item.endOffset - item.startOffset);
						text = '<span class="aloha" style="font-size: '+newSize+'">' + text + '</span>';
            text = item.domobj.data.substr(0,item.startOffset) + text;
            text = text + item.domobj.data.substr(item.endOffset, item.domobj.data.length - item.endOffset);
            jQuery(item.domobj).replaceWith(text);
          }
          else if (item.domobj.tagName.toLowerCase() == 'span' && item.selection == "full") {
            var newSize = (parseInt(jQuery(item.domobj).css('font-size')) + (index === 0?1:-1)) + 'px';
            jQuery(item.domobj).css('font-size',newSize);
            jQuery(item.domobj).find('span').each(function () {
              newSize = (parseInt(jQuery(this).css('font-size')) + (index === 0?1:-1)) + 'px';
              jQuery(this).css('font-size',newSize);
            });
          }
          else {
            for (var j = 0; j < item.children.length; j++) {
              if (item.children[j].selection == "partial" || item.children[j].selection == "full")
                replaceChild(item.children[j],index);
            };
          }
			},
    }); //end pluginCreate
});
