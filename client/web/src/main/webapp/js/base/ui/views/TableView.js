"use strict";
var Poker = Poker || {};
Poker.TableView = Poker.TabView.extend({
    layoutManager : null,
    tableViewContainer : null,
    init : function(layoutManager,name) {
        this._super("#"+layoutManager.tableView.attr("id"),name);
        this.layoutManager = layoutManager;
        this.tableViewContainer = $(".table-view-container");
    },
    onViewActivated : function() {

        this.tableViewContainer.show();
        this.layoutManager.onActivateView();
        this.activateTab();
        this.getViewElement().removeClass("no-transitions");
    },
    onViewDeactivated : function() {

        this.tableViewContainer.hide();
        this.deactivateTab();
        this.getViewElement().addClass("no-transitions");
        this.layoutManager.onDeactivateView();

    },
    close : function() {
        this.removeTab();
        this.getViewElement().remove();
        this.setViewElement(null);
    },
    getTableId : function()  {
        return this.layoutManager.tableId;
    },
    calculateFontSize : function() {
        var targetFontSize =  Math.round(90* this.tableViewContainer.width()/this.baseWidth);
        if(targetFontSize>130) {
            targetFontSize=130;
        }
        this.getViewElement().css({fontSize : targetFontSize+"%"});
    },
    calculateSize : function(maxWidth,maxHeight, aspectRatio) {
        var dim = Poker.Utils.calculateDimensions(maxWidth, maxHeight, aspectRatio);
        var marginLeft =  Math.round((maxWidth-this.tableViewContainer.width())/2);
        this.tableViewContainer.width(dim.width).height(dim.height).css({marginLeft : marginLeft});
        this.getViewElement().css({width:"100%",height:"100%"});
    }

});
