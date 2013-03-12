"use strict";
var Poker = Poker || {};

/**
 * Main entry point for table events.
 * Handles all table state objects delegates
 * to the Poker.TableLayoutManager
 * @type {Poker.TableManager}
 */
Poker.TableManager = Class.extend({

    /**
     * @type Poker.Table
     */
    tables : null,
    /**
     * This is a workaround for not having the table names in all the
     * table packets, not very pretty maybe...
     */
    tableNames : null,
    init : function() {
        this.tables = new Poker.Map();
        this.tableNames = new Poker.Map();
    },
    /**
     * Checks whether a table exist
     * @param {Number} tableId to check
     * @return {Boolean}
     */
    tableExist : function(tableId) {
        return this.tables.contains(tableId)
    },
    /**
     * Checks if you are seated at a specific table
     * @param {Number} tableId
     */
    isSeated : function(tableId) {
        var table =  this.getTable(tableId);
        if(table!=null) {
            return table.myPlayerSeat != null;
        }
        return false;
    },
    /**
     * Handles open table accepted
     * @param {Number} tableId
     * @param {Number} capacity
     */
    handleOpenTableAccepted : function (tableId, capacity) {
        var name = this.tableNames.get(tableId);
        if (name == null) {
            name = "Table"; //TODO: fix
        }
        var tableViewContainer = $(".table-view-container");
        var templateManager = new Poker.TemplateManager();
        var soundManager = new Poker.SoundManager(Poker.AppCtx.getSoundRepository(), tableId);
        var tableLayoutManager = new Poker.TableLayoutManager(tableId, tableViewContainer, templateManager, capacity, soundManager);
        this.createTable(tableId, capacity, name , tableLayoutManager);
        Poker.AppCtx.getViewManager().addTableView(tableLayoutManager,name);
    },

    onPlayerLoggedIn : function() {
       console.log("Checking if there's open tables to reconnect to");
       var tables =  this.tables.values();
        for(var i = 0; i<tables.length; i++) {
            this.leaveTable(tables[i].id);
            new Poker.TableRequestHandler(tables[i].id).openTable();
        }
    },
    /**
     * Creates a table and notifies it's table layout manager
     * @param {Number} tableId - id of the table
     * @param {Number} capacity - nr of players
     * @param {String} name  - name of the table
     * @param {Poker.TableLayoutManager} tableLayoutManager
     */
    createTable : function(tableId,capacity,name, tableLayoutManager) {
        console.log("Creating table " + tableId + " with name = " + name);
        var table = new Poker.Table(tableId,capacity,name);
        table.layoutManager = tableLayoutManager;
        this.tables.put(tableId,table);
        tableLayoutManager.onTableCreated();

        console.log("Nr of tables open = " + this.tables.size());
    },
    /**
     * Handles a buy-in response and notifies the table layout manager
     * @param {Number} tableId to handle buy-in response for
     * @param {Number} status buy-in result code
     */
    handleBuyInResponse : function(tableId,status) {
        if(status == com.cubeia.games.poker.io.protocol.BuyInResultCodeEnum.PENDING) {
           var table = this.getTable(tableId);
           table.getLayoutManager().onBuyInCompleted();
        } else if(status != com.cubeia.games.poker.io.protocol.BuyInResultCodeEnum.OK){
            this.handleBuyInError(tableId,status);
        }
    },
    /**
     * @param {Number} tableId
     * @param {Number} status
     */
    handleBuyInError : function(tableId,status) {
        console.log("buy-in status = " + status);
        var table = this.getTable(tableId);
        table.getLayoutManager().onBuyInError("Unable to buy in");
    },
    /**
     * @param {Number} tableId
     * @param {Number} balanceInWallet
     * @param {Number} balanceOnTable
     * @param {Number} maxAmount
     * @param {Number} minAmount
     * @param {Boolean} mandatory
     */
    handleBuyInInfo : function(tableId,balanceInWallet, balanceOnTable, maxAmount, minAmount,mandatory) {
        var table = this.getTable(tableId);
        table.getLayoutManager().onBuyInInfo(table.name,balanceInWallet,balanceOnTable,maxAmount,minAmount,mandatory);

    },
    /**
     * Retrieves the table with the specified id
     * @param {Number} tableId
     * @return {Poker.Table}
     */
    getTable : function(tableId) {
        return this.tables.get(tableId);
    },
    /**
     * @param {Number} tableId
     * @param {String} handId
     */
    startNewHand : function(tableId, handId) {
        var table = this.tables.get(tableId);
        table.handCount++;
        table.handId = handId;
        table.layoutManager.onStartHand(handId);
    },
    /**
     * Called when a hand is complete and calls the TableLayoutManager
     * This method will trigger a tableManager.clearTable after
     * 15 seconds (us
     * @param {Number} tableId
     * @param {com.cubeia.games.poker.io.protocol.BestHand[]} hands
     * @param {com.cubeia.games.poker.io.protocol.PotTransfers} potTransfers
     */
    endHand : function(tableId,hands,potTransfers) {
        for (var i = 0; i<hands.length; i++) {
            this.updateHandStrength(tableId,hands[i]);
        }
        var table = this.tables.get(tableId);
        console.log("pot transfers:");
        console.log(potTransfers);
        var count = table.handCount;
        var self = this;

        if(potTransfers.fromPlayerToPot === false ){
            table.layoutManager.onPotToPlayerTransfers(potTransfers.transfers);
        }

        setTimeout(function(){
            //if no new hand has started in the next 15 secs we clear the table
            self.clearTable(tableId,count);
        },15000);
    },
    /**
     *
     * @param {Number} tableId
     * @param {com.cubeia.games.poker.io.protocol.BestHand} bestHand
     */
    updateHandStrength : function(tableId,bestHand) {
        this.showHandStrength(tableId,bestHand.player, Poker.Hand.fromId(bestHand.handType));
    },
    /**
     * calls the layout manager to clear the table UI
     * @param {Number} tableId
     * @param {Number} handCount hand identifier that has to match for the tables to be cleared
     */
    clearTable : function(tableId,handCount) {
        var table = this.tables.get(tableId);
        if(table.handCount==handCount) {
            console.log("No hand started clearing table");
            table.layoutManager.onStartHand(this.dealerSeatId);
        } else {
            console.log("new hand started, skipping clear table")
        }
    },
    /**
     *
     * @param {Number} tableId
     * @param {Number} playerId
     * @param {Poker.Hand} hand
     */
    showHandStrength : function(tableId,playerId,hand) {
        var table = this.tables.get(tableId);
        var player = table.getPlayerById(playerId);
        table.getLayoutManager().onPlayerHandStrength(player,hand);
    },
    /**
     *
     * @param {Number} tableId
     * @param {Number} playerId
     * @param {Poker.ActionType} actionType
     * @param {Number} amount
     */
    handlePlayerAction : function(tableId,playerId,actionType,amount){
        var table = this.tables.get(tableId);
        var player = table.getPlayerById(playerId);
        table.getLayoutManager().onPlayerActed(player,actionType,amount);
    },
    /**
     *
     * @param {Number} tableId
     * @param {Number} seatId
     */
    setDealerButton : function(tableId,seatId) {
        var table = this.getTable(tableId);
        table.getLayoutManager().onMoveDealerButton(seatId);
    },
    /**
     * Adds a player to a specific table and notifies the layout manager
     * @param {Number} tableId
     * @param {Number} seat
     * @param {Number} playerId
     * @param {String} playerName
     */
    addPlayer : function(tableId,seat,playerId, playerName) {
        console.log("adding player " + playerName + " at seat" + seat + " on table " + tableId);
        var table = this.tables.get(tableId);
        var p = new Poker.Player(playerId, playerName);
        table.addPlayer(seat,p);
        if(playerId == Poker.MyPlayer.id) {
            table.myPlayerSeat = seat;
        }
        table.getLayoutManager().onPlayerAdded(seat,p);
    },
    /**
     * Removes a player from a table and notifies the table layout manager
     * @param {Number} tableId
     * @param {Number} playerId
     */
    removePlayer : function(tableId,playerId) {
        console.log("removing player with playerId " + playerId);
        var table = this.tables.get(tableId);
        table.removePlayer(playerId);
        if(playerId == Poker.MyPlayer.id) {
            table.myPlayerSeat = null;
        }
        table.getLayoutManager().onPlayerRemoved(playerId);
    },
    /**
     * handle deal cards, passes a card string as parameter
     * card string i h2 (two of hearts), ck (king of spades)
     * @param {Number} tableId the id of the table
     * @param {Number} playerId  the id of the player
     * @param {Number} cardId id of the card
     * @param {String} cardString the card string identifier
     */
    dealPlayerCard : function(tableId,playerId,cardId,cardString) {
        var table = this.tables.get(tableId);
        var player = table.getPlayerById(playerId);
        table.getLayoutManager().onDealPlayerCard(player,cardId, cardString);
    },
    /**
     * Updates a players table balance
     * @param {Number} tableId
     * @param {Number} playerId
     * @param {Number} balance
     */
    updatePlayerBalance : function(tableId,playerId, balance) {
        var table = this.tables.get(tableId);
        var p = table.getPlayerById(playerId);
        if(p == null) {
            console.log("Unable to find player to update balance playerId = " + playerId + ", tableId = " + tableId);
            return;
        }
        p.balance = balance;
        table.getLayoutManager().onPlayerUpdated(p);
    },

    /**
     * @param {Number} tableId
     * @param {Number} playerId
     * @param {Poker.PlayerTableStatus} status
     */
    updatePlayerStatus : function(tableId, playerId, status) {
        var table = this.tables.get(tableId);
        var p = table.getPlayerById(playerId);
        if(p==null) {
            throw "Player with id " + playerId + " not found";
        }
        p.tableStatus = status;
        table.getLayoutManager().onPlayerUpdated(p);
    },
    setNoMoreBlinds : function(tableId, enable) {
        var table = this.tables.get(tableId);
        table.noMoreBlinds = enable;
    },
    handleRequestPlayerAction : function(tableId,playerId,allowedActions,timeToAct) {
        var table = this.tables.get(tableId);
        var player = table.getPlayerById(playerId);
        var fixedLimit = table.betStrategy === com.cubeia.games.poker.io.protocol.BetStrategyEnum.FIXED_LIMIT;
        table.getLayoutManager().onRequestPlayerAction(player,allowedActions,timeToAct,this.totalPot,fixedLimit);
    },
    updateTotalPot : function(tableId,amount){
        var table = this.tables.get(tableId);
        table.totalPot = amount;
        table.getLayoutManager().onTotalPotUpdate(amount);
    },
    dealCommunityCard : function(tableId,cardId,cardString) {
        var table = this.getTable(tableId);
        table.getLayoutManager().onDealCommunityCard(cardId,cardString);
    },
    /**
     *
     * @param {Number} tableId
     * @param {Poker.Pot[]} pots
     */
    updatePots : function(tableId,pots) {
        var table = this.tables.get(tableId);
        var totalPot = 0;
        for(var i = 0; i<pots.length; i++) {
            totalPot+=pots[i].amount;
        }
        table.getLayoutManager().onTotalPotUpdate(totalPot);
        table.getLayoutManager().onPotUpdate(pots);
    },

    exposePrivateCards: function(tableId, cards) {

        for (var i = 0; i < cards.length; i ++ ) {
            var cardId = cards[i].card.cardId;
            var cardstring = Poker.Utils.getCardString(cards[i].card)

            this.exposePrivateCard(tableId, cardId, cardstring);

        }
    },

    exposePrivateCard : function(tableId,cardId,cardString) {
        var table = this.getTable(tableId);
        table.getLayoutManager().onExposePrivateCard(cardId, cardString);
    },

    notifyWaitingToStartBreak : function() {
        var dialogManager = Poker.AppCtx.getDialogManager();
        dialogManager.displayGenericDialog({header:"Message",
            message:"Break is about to start, waiting for other tables to finish."});
    },
    /**
     *
     * @param {Number} tableId
     * @param {com.cubeia.games.poker.io.protocol.BlindsLevel} newBlinds
     * @param {Number} secondsToNextLevel
     */
    notifyGameStateUpdate : function(tableId, newBlinds, secondsToNextLevel,betStrategy) {
        console.log("Seconds to next level: " + secondsToNextLevel);
        console.log("notifyGameStateUpdate = " + betStrategy);
        var table = this.getTable(tableId);
        table.betStrategy = betStrategy;
        this.notifyBlindsUpdated(tableId, newBlinds, secondsToNextLevel);
    },
    notifyBlindsUpdated : function(tableId, newBlinds, secondsToNextLevel) {
        console.log("Seconds to next level: " + secondsToNextLevel);
        if (newBlinds.isBreak) {
            var dialogManager = Poker.AppCtx.getDialogManager();
            dialogManager.displayGenericDialog({header:"Message",
                message:"We are now on a break. Game will resume in " + secondsToNextLevel + " seconds."});
        }
        var table = this.getTable(tableId);
        table.getLayoutManager().onBlindsLevel(newBlinds, secondsToNextLevel);
    },
    notifyTournamentDestroyed : function(tableId) {
        var dialogManager = Poker.AppCtx.getDialogManager();
        dialogManager.displayGenericDialog({header:"Message", message:"This tournament is now closed."});
        this.tables.get(tableId).tournamentClosed = true;
    },
    bettingRoundComplete : function(tableId) {
        var table = this.getTable(tableId);
        table.getLayoutManager().onBettingRoundComplete();

    },
    leaveTable : function(tableId) {
        console.log("REMOVING TABLE = " + tableId);
        var table = this.tables.remove(tableId);
        if (table == null) {
            console.log("table not found when removing " + tableId);
        } else {
            table.getLayoutManager().onLeaveTableSuccess();
            table.leave();
        }
        Poker.AppCtx.getViewManager().removeTableView(tableId);
    },
    /**
     *
     * @param {Number} tableId
     * @param {Poker.ActionType[]} actions
     * @param {Number} callAmount
     * @param {Number} minBetAmount
     */
    onFutureAction : function(tableId, actions, callAmount, minBetAmount) {
        var table = this.getTable(tableId);
        if (actions.length > 0) {
            var futureActions = this.getFutureActionTypes(actions);
            table.getLayoutManager().displayFutureActions(futureActions, callAmount, minBetAmount);
        }
    },
    /**
     *
     * @param {Poker.ActionType[]} actions
     */
    getFutureActionTypes : function(actions) {
        var futureActions = new Poker.Map();
        var put = function(type){
            futureActions.put(type.id,type);
        };
        for (var i = 0; i < actions.length; i++) {
            var act = actions[i];
            switch (act.id) {
                case Poker.ActionType.CHECK.id:
                    put(Poker.FutureActionType.CHECK_OR_FOLD);
                    put(Poker.FutureActionType.CHECK_OR_CALL_ANY);
                    break;
                case Poker.ActionType.CALL.id:
                    put(Poker.FutureActionType.CALL_CURRENT_BET);
                    put(Poker.FutureActionType.CALL_ANY);
                    break;
                case Poker.ActionType.RAISE.id:
                    put(Poker.FutureActionType.RAISE);
                    put(Poker.FutureActionType.RAISE_ANY);
                    break;
            }
        }
        if (actions.length > 0) {
            put(Poker.FutureActionType.FOLD);
        }
        return futureActions.values();
    }

});
