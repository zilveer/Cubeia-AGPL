"use strict";
var Poker = Poker || {};
/**
 * Handles all interactions and UI for a players seat
 * @type {Poker.Seat}
 */
Poker.Seat = Class.extend({
   templateManager : null,
   seatId : -1,
   player : null,
   seatElement : null,
   progressBarElement : null,
   cssAnimator : null,
   cards : null,
   cardsContainer : null,
   avatarElement : null,
   actionAmount : null,
   actionText : null,
   handStrength : null,
   seatBalance : null,
   init : function(seatId, player, templateManager) {
       this.seatId = seatId
       this.player = player;
       this.templateManager = templateManager;
       this.seatElement =  $("#seat"+this.seatId);
       this.cssAnimator = new Poker.CSSAnimator();
       this.renderSeat();

   },
   setSeatPos : function(previousPos, position) {
     this.seatElement.removeClass("seat-empty").removeClass("seat-pos-"+previousPos).removeClass("seat-inactive").addClass("seat-pos-"+position);
   },
   renderSeat : function() {
       var output = Mustache.render(this.templateManager.getTemplate("seatTemplate"),this.player);
       this.seatElement.html(output);
       this.progressBarElement = this.seatElement.find(".progress-bar");
       this.avatarElement = this.seatElement.find(".avatar");
       this.avatarElement.addClass("avatar"+(this.player.id%9));

       this.cardsContainer = this.seatElement.find(".cards-container");
       this.actionAmount = this.seatElement.find(".action-amount");
       this.actionText = this.seatElement.find(".action-text");
       this.seatBalance = this.seatElement.find(".seat-balance");
       this.handStrength = this.seatElement.find(".hand-strength");

       this.reset();
   },
   getDealerButtonOffsetElement : function() {
       return this.avatarElement;
   },
   clearSeat : function() {
       this.seatElement.html("");
   },
   updatePlayer : function(player) {
       this.player = player;
       var balanceDiv = this.seatBalance;
       if (this.player.balance == 0) {
           balanceDiv.html("All in");
           balanceDiv.removeClass("balance");
       } else {
           balanceDiv.html("&euro;"+this.player.balance);
           balanceDiv.addClass("balance");
       }
       this.handlePlayerStatus();
   },
   handlePlayerStatus : function() {
       if(this.player.tableStatus == Poker.PlayerTableStatus.SITTING_OUT) {
            this.seatElement.addClass("seat-sit-out");
            this.seatElement.find(".player-status").html(this.player.tableStatus.text);
       } else {
           this.seatElement.find(".player-status").html("").hide();
           this.seatElement.removeClass("seat-sit-out");
       }
   },
   reset : function() {
       this.hideActionInfo();
       this.handStrength.html("").hide();
       this.clearProgressBar();
       if(this.cardsContainer) {
           this.cardsContainer.empty();
       }
       this.seatElement.removeClass("seat-folded");
   },
   hideActionInfo : function() {
       this.hideActionText();
       if(this.actionAmount!=null) {
           this.actionAmount.html("");
       }
   },
   hideActionText : function() {
       this.actionText.html("").hide();
   },
   onAction : function(actionType,amount) {
       this.inactivateSeat();
       this.showActionData(actionType,amount);
       if(actionType == Poker.ActionType.FOLD) {
            this.fold();
       }
   },
   showActionData : function(actionType,amount) {
       this.actionText.html(actionType.text).show();
       var icon = $("<div/>").addClass("player-action-icon").addClass(actionType.id);
       if(amount>0) {
           this.actionAmount.removeClass("placed");
           this.actionAmount.empty().append("&euro;").append(amount).append(icon).show();
           this.animateActionAmount();
       }
   },
   animateActionAmount : function() {
       var self = this;
       setTimeout(function(){
            self.actionAmount.addClass("placed");
       },100);
   },
   fold : function() {
       this.seatElement.addClass("seat-folded");
       this.seatElement.removeClass("active-seat");
       this.seatElement.find(".player-card-container img").attr("src","images/cards/gray-back.svg");

   },
   dealCard : function(card) {
       this.cardsContainer.append(card.render());
       this.animateDealCard(card.getJQElement());
   },
   animateDealCard : function(div) {
      setTimeout(function(){
          div.addClass("dealt");
      },100);

   },
   inactivateSeat : function() {
        this.seatElement.removeClass("active-seat");
        this.clearProgressBar();
   },
   clearProgressBar : function() {
       if(this.progressBarElement) {
           this.progressBarElement.attr("style","").hide();
       }
   },
    /**
     * When a betting round is complete (community cards are dealt/shown);
     */
   onBettingRoundComplete : function(){
       this.inactivateSeat();


   },
   activateSeat : function(allowedActions, timeToAct,mainPot) {
       this.seatElement.addClass("active-seat");
       this.progressBarElement.show();
       var div = this.progressBarElement.get(0);
       this.cssAnimator.addTransition(div,"transform " + timeToAct/1000+"s linear");
       var self = this;
       setTimeout(function(){
            self.cssAnimator.addTransform(div,"scale3d(1,0.01,0)","bottom");
       },50);
   },
   showHandStrength : function(hand) {
       this.actionAmount.html("");
       this.actionText.html("").hide();
       if(hand.id != Poker.Hand.UNKNOWN.id) {
           this.handStrength.html(hand.text).show();
       }

   },
   clear : function() {

   },
   moveAmountToPot : function() {
       this.hideActionInfo();
       return;
       //before enabling animations for bet amounts going into the pot we need a better
       //handling of animations
       var self = this;
       var amount = this.actionAmount.get(0);

       this.cssAnimator.addTransitionCallback(amount, function(e){
           self.onMoveToPotEnd();
       });
       setTimeout(function(){
           self.moveToPotComplete = false;
           var pos = self.calculatePotOffset();
           self.cssAnimator.addTransform(amount,"translate3d("+pos.left+","+pos.top+",0)");
       },50);

       setTimeout(function(){
           self.onMoveToPotEnd();
       }, 700);
   },
   moveToPotComplete : true,
   onMoveToPotEnd : function() {
       if(this.moveToPotComplete == false) {
           this.moveToPotComplete = true;
           this.hideActionInfo();
           this.actionAmount.attr("style","");
           this.cssAnimator.removeTransitionCallback(this.actionAmount.get(0))
       }
   },
   calculatePotOffset : function(){
        var c = $("#tableView");
        var width = c.width();
        var height = c.height();
        var amountOffset = this.actionAmount.offset();
        var mainPotOffset = $("#mainPotContainer").offset();
        var left = mainPotOffset.left - amountOffset.left;
        var top = mainPotOffset.top - amountOffset.top;
        return { top : Math.round(top) +"px", left :Math.round(left)+"px" };
   },
   isMySeat : function() {
       return false;
   },
   onPotWon : function(potId,amount) {
    console.log("player " + this.player.name + " wom " + amount);
    this.handStrength.addClass("won");
    this.hideActionInfo();
   }
});
