/*global define*/
define([
	'jQuery-2.1.4.min',
	'underscore_1.3.3',
	'backbone_0.9.2',
  'tinymce/tinymce.min',
  'bootstrap-datepicker.min',
  'text!../../../js/app/templates/pagesAddNew.html'
], function ($, _, Backbone, TinyMCE, Datepicker, PagesAddNewTemplate) {
	'use strict';

	var PagesAddNewView = Backbone.View.extend({

		tagName:  'div',
    
    el: '#pagesAddNewView', 

		template: _.template(PagesAddNewTemplate),

		// The DOM events specific to an item.
		events: {
			//'click .toggle':	'toggleCompleted',
			//'dblclick label':	'edit',
			//'click .destroy':	'clear',
			//'keypress .edit':	'updateOnEnter',
			//'keydown .edit':	'revertOnEscape',
			//'blur .edit':		'close'
      'click #submitPage': 'submitPage'
		}, 

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function () {
			//this.listenTo(this.model, 'change', this.render);
			//this.listenTo(this.model, 'destroy', this.remove);
			//this.listenTo(this.model, 'visible', this.toggleVisible);
		},

		// Re-render the titles of the todo item.
		
    render: function () {
      
      
      //debugger;
      try {
        
        
        
        //if( tinymce.editors.length == 0 ) {
        if( global.tinymce.initialized == false) {
          
          log.push('Initializing TinyMCE editor...')

          //Rendering the template destroys the existing TinyMCE editor. I only want to render the template if the TinyMCE editor
          //hasn't been created yet.
          //this.$el.html(this.template(this.model.toJSON()));
          this.$el.html(this.template);
          
          //Fill out the Section drop-down
          this.$el.find('#section').find('option').text(global.pageSectionCollection.models[0].get('name')); //First Section
          for( var i = 1; i < global.pageSectionCollection.models.length; i++ ) { //The rest of the sections
            this.$el.find('#section').append('<option>'+global.pageSectionCollection.models[i].get('name')+'</option>');
          }

          tinymce.init({
            selector: '#pageContent',
            //menubar: 'edit view format insert',
            menubar: false,
            toolbar: 'bold, italic, underline, strikethrough, alignleft, aligncenter, alignright, alignjustify, bullist, numlist, outdent, indent, removeformat, subscript, superscript, image_gallery, code',
            plugins: 'code, image_gallery',
            browser_spellcheck: true,
            image_caption: true,
            
            //The setup function runs when the TinyMCE editor has finished loading. It's kind of like the document.ready() function.
            setup: function (ed) {
              ed.on('init', function(args) {
                //debugger;  

                global.tinymce.initialized = true;
                log.push('TinyMCE editor initialized.')

                //User clicked on existing page and wants to edit it.
                if( global.tinymce.currentModelIndex != null ) {
                  global.pagesAddNewView.loadPage(global.tinymce.currentModelIndex);
                  global.tinymce.currentModelIndex = null; //Clear to signal that this request has been processed.
                //User clicked on Add New link in left menu and wants to create a new page.
                } else {
                  global.pagesAddNewView.newPage();
                }
              });
            },


          });
        //If the TinyMCE editor has already been loaded...
        } else {

          //User clicked on existing page and wants to edit it.
          if( global.tinymce.currentModelIndex != null ) {
            global.pagesAddNewView.loadPage(global.tinymce.currentModelIndex);
            global.tinymce.currentModelIndex = null; //Clear to signal that this request has been processed.

          //User clicked on Add New link in left menu and wants to create a new page.
          } else {
            global.pagesAddNewView.newPage();
          }
        }
        
        
        
      } catch(err) {
        console.error('Error while trying to render pagesAddNewView. Error message: ');
        console.error(err.message);
        
        log.push('Error while trying to render pagesAddNewView. Error message: ');
        log.push(err.message);
        sendLog();
      }
      
			return this;
		},
    
    //This function is called when the 'Add New' link is clicked on the left menu. It indicates the user wants
    //to create a new, blank page.
    newPage: function() {
      try {
        //debugger;
        this.$el.find('#pageTitle').val('');
        tinymce.activeEditor.setContent('');

        //Create an empty model to store the page data.
        this.model = global.pagesCollection.models[0].clone();
        this.model.id = "";
        this.model.set('_id', '');
        this.model.attributes.content.brief = '';
        this.model.attributes.content.extended = '';
        this.model.set('publishedDate', '');
        this.model.set('slug', '');
        this.model.set('title', '');
        this.model.set('state', 'draft');

        //Set published state drop-down to default to 'Draft'
        this.$el.find('#publishedState').val('Draft');
        
        //Set page author as currently logged in user.
        this.model.set('author', userdata._id);

        //Set default date to today.
        var today = new Date();
        this.model.set('publishedDate', today.getFullYear()+'-'+('00'+(today.getMonth()+1)).slice(-2)+'-'+('00'+(today.getDate()+1)).slice(-2));
        this.$el.find('#publishedDate').val(('00'+(today.getMonth()+1)).slice(-2)+'/'+('00'+(today.getDate()+1)).slice(-2)+'/'+today.getFullYear());

        //Hide the delete page button.
        this.$el.find('#deletePage').hide();
        
        log.push('Loaded new page.')
        
      } catch (err) {
        console.error('Error while trying to load newPage() in pagesAddNewView. Error message: ');
        console.error(err.message);

        log.push('Error while trying to load newPage() in pagesAddNewView. Error message: ');
        log.push(err.message);
        sendLog();
      }
    },
    
    //This function is called when the user clicks on an existing page in the 'Pages' View.
    loadPage: function(model_index) {
      try {

        //debugger;

        //Retrive the selected Page model from the pagesCollection.
        this.model = global.pagesCollection.models[model_index];

        //global.pagesAddNewView.pageId = model.id;

        //Fill out the form on the pagesAddNewView with the content stored in the Page model.
        this.$el.find('#pageTitle').val(this.model.get('title'));
        tinymce.activeEditor.setContent(this.model.get('content').extended);

        //Published state
        //Change the State drop-down based on the current Model.
        if( this.$el.find('#publishedState').find('option').first().text().toLowerCase() == this.model.get('state') ) {
          this.$el.find('#publishedState').val('Draft');
        } else if( this.$el.find('#publishedState').find('option').first().next().text().toLowerCase() == this.model.get('state') ) {
          this.$el.find('#publishedState').val('Published');
        } else if( this.$el.find('#publishedState').find('option').last().text().toLowerCase() == this.model.get('state') ) {
          this.$el.find('#publishedState').val('Archived');
        }
        
        //Set page author as currently logged in user.
        this.model.set('author', userdata._id);

        //Set the Date to the Model's date.
        var publishedDate = this.model.get('publishedDate'); //Get date string from model.
        publishedDate = new Date(publishedDate.slice(0,4), publishedDate.slice(5,7)-1, publishedDate.slice(8,10)); //Convert date string to Date object.
        //var datestr = (publishedDate.getMonth()+1)+'/'+publishedDate.getDate()+'/'+publishedDate.getFullYear();
        this.$el.find('#publishedDate').val(('00'+(publishedDate.getMonth()+1)).slice(-2)+'/'+('00'+(publishedDate.getDate())).slice(-2)+'/'+publishedDate.getFullYear());

        //Set the Section from the Model.
        for( var i = 0; i < global.pageSectionCollection.models.length; i++ ) { //Loop through all the page sections          
          //Corner case: If the page has no sections assigned to it, load the first Section as default.
          if( this.$el.find('#section')[0] == undefined) {
            this.$el.find('#section').val(global.pageSectionCollection.models[0].get('name'));
            break;
          }

          //Find the Section GUID that matches the one in the Model
          if( this.model.get('sections')[0] == global.pageSectionCollection.models[i].get('_id') ) {
            //Assign the corresponding Section to this page.
            //this.model.set('sections', [global.pageSectionCollection.models[i].get('_id')]);
             this.$el.find('#section').val(global.pageSectionCollection.models[i].get('name'));
            //Break out of the loop.
            break;
          }
        }

        //Show the delete page button.
        this.$el.find('#deletePage').show();
        
        log.push('Loaded page '+this.model.get('title'));

      } catch (err) {
        console.error('Error while trying to loadPage() in pagesAddNewView. Error message: ');
        console.error(err.message);

        log.push('Error while trying to loadPage() in pagesAddNewView. Error message: ');
        log.push(err.message);
        sendLog();
      }
      
    },
    
    submitPage: function() {
      //debugger;
      
      //submission behavior is different if this is a new page or an existing page.
      if(this.model.id == "") { //New Page
        try {
        
          //debugger;

          //Don't try to create a new page without a title.
          if( this.$el.find('#pageTitle').val() == "" ) {
            alert('Please give the page a title.');
            return;
          }

          //Title and Slug
          var str = this.$el.find('#pageTitle').val();
          this.model.set('title', str);
          str = str.replace(/ /g, '-');
          this.model.set('slug', str.toLowerCase());

          //Published state
          this.model.set('state', this.$el.find('#publishedState').val().toLowerCase());

          //Date
          //#publishedDate form field uses format MM/DD/YYYY
          //KeystoneJS model uses format YYYY-MM-DD
          var pageDate = new Date(this.$el.find('#publishedDate').val());
          this.model.set('publishedDate', pageDate.getFullYear()+'-'+('00'+(pageDate.getMonth()+1)).slice(-2)+'-'+('00'+pageDate.getDate()).slice(-2));

          //Set author to the currently logged in user
          this.model.set('author', userdata._id);

          //Set the Section for the new page.
          for( var i = 0; i < global.pageSectionCollection.models.length; i++ ) { //Loop through all the page sections          
            //Find the Section that matches one selected in the drop-down.
            if( this.$el.find('#section').val() == global.pageSectionCollection.models[i].get('name') ) {
              //Assign the corresponding Section to this page.
              this.model.set('sections', [global.pageSectionCollection.models[i].get('_id')]);
              //Break out of the loop.
              break;
            }
          }

          //Add Content
          this.model.attributes.content.extended = tinymce.activeEditor.getContent();

          //Send new Model to server
          $.get('http://'+global.serverIp+':'+global.serverPort+'/api/page/create', this.model.attributes, function(data) {
            //debugger;

            //The server will return the same object we submitted but with the _id field filled out. A non-blank _id field
            //represents a success.
            if( data.page._id != "" ) {
              //Fetch/update the pagesCollection so that it includes the new page.
              global.pagesCollection.fetch();

              log.push('New page '+data.page._id+' successfully updated.')

              global.pagesAddNewView.$el.find('.modal-sm').find('#waitingGif').hide();
              global.pagesAddNewView.$el.find('.modal-sm').find('#successMsg').show();
            } else { //Fail
              console.error('New page not accepted by server!')
            }
          });

          //debugger;
        } catch (err) {
          console.error('Error while trying to submit new page in pagesAddNewView. Error message: ');
          console.error(err.message);

          log.push('Error while trying to submit new page in pagesAddNewView. Error message: ');
          log.push(err.message);
          sendLog();
        }
        
      } else { //Existing page
        debugger;
        try {
          //Date
          //#publishedDate form field uses format MM/DD/YYYY
          //KeystoneJS model uses format YYYY-MM-DD
          var pageDate = new Date(this.$el.find('#publishedDate').val());
          pageDate = pageDate.getFullYear()+'-'+('00'+(pageDate.getMonth()+1)).slice(-2)+'-'+('00'+pageDate.getDate()).slice(-2);

          //Set the Section for the Model.
          for( var i = 0; i < global.pageSectionCollection.models.length; i++ ) { //Loop through all the page sections          

            //Find the Section GUID that matches the one in the dropdown
            if( this.$el.find('#Section').val() == global.pageSectionCollection.models[i].get('name') ) {
              //Assign the corresponding Section to this page.
              this.model.set('sections', [global.pageSectionCollection.models[i].get('_id')]);
              //Break out of the loop.
              break;
            }
          }

          var content = this.model.get('content');
          content.extended = tinymce.activeEditor.getContent();

          this.model.set({
            'title': this.$el.find('#pageTitle').val(),
            //Design Note: slug does not get updated.
            'state': this.$el.find('#publishedState').val().toLowerCase(),
            'publishedDate': pageDate,
            'author': userdata._id,
            'content': content,
          });

          //Send new Model to server
          $.get('http://'+global.serverIp+':'+global.serverPort+'/api/page/'+this.model.id+'/update', this.model.attributes, function(data) {
            //debugger;

            //The server will return the same object we submitted but with the _id field filled out. A non-blank _id field
            //represents a success.
            if( data.page._id != "" ) {
              //Fetch/update the pagesCollection so that it includes the new page.
              global.pagesCollection.fetch();

              log.push('Page '+data._id+' successfully updated.');

              global.pagesAddNewView.$el.find('.modal-sm').find('#waitingGif').hide();
              global.pagesAddNewView.$el.find('.modal-sm').find('#successMsg').show();
            } else { //Fail
              console.error('Page'+data._id+' not updated!')
            }
          });
        
        //debugger;
        } catch (err) {
          console.error('Error while trying to update existing  in pagesAddNewView. Error message: ');
          console.error(err.message);

          log.push('Error while trying to update existing  in pagesAddNewView. Error message: ');
          log.push(err.message);
          sendLog();
        }
      }
    },
    
    deletePage: function() {
      //debugger;
      
      log.push('Preparing to delete  '+this.model.get('title')+' (id: '+this.model.id+')');
      
      $.get('http://'+global.serverIp+':'+global.serverPort+'/api/remove/'+this.model.id+'/remove', '', function(data) {
        //debugger;
        if( data.success == true ) {
          log.push('Page successfully deleted.');
          
          global.pagesCollection.fetch(); //Update the pages collection.
          global.leftMenuView.showPagesAddNew(); //Refresh the view
        } else {
          log.push('Page not deleted!');
          console.error('Error in function deletePage(). Page not deleted.');
        }
      });
    }
    

	});

  //debugger;
	return PagesAddNewView;
});
