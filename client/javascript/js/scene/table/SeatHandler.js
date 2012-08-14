SeatHandler = function() {
    this.activeSeatEntity = null;
};

SeatHandler.prototype.removePlayerFromSeat = function(seatEntity) {
    document.getElementById(seatEntity.spatial.transform.anchorId).style.opacity = 0.4;
    seatEntity.occupant = null;
};

SeatHandler.prototype.getSeatEntityIdBySeatNumber = function(seatNr) {
    return "seat_nr_"+seatNr;
};

SeatHandler.prototype.setSeatEntityToPassive = function(seatEntity) {
    this.setSeatTimerPercentRemaining(seatEntity, 0);

    document.getElementById(seatEntity.ui.seatActionFrameDivId).style.backgroundColor = "#eee";
    document.getElementById(seatEntity.ui.seatActionFrameDivId).style.borderColor = "#555";
    document.getElementById(seatEntity.ui.seatActionSlotDivId).className = "seat_turn_state_passive";

}

SeatHandler.prototype.setCurrentActingSeatEntity = function(seatEntity) {

    if (this.activeSeatEntity) {
        this.setSeatEntityToPassive(this.activeSeatEntity)
    };

    this.activeSeatEntity = seatEntity;
    document.getElementById(this.activeSeatEntity.ui.seatActionFrameDivId).style.backgroundColor = "#8f8";
    document.getElementById(this.activeSeatEntity.ui.seatActionSlotDivId).className = "seat_turn_state_active";
    document.getElementById(seatEntity.ui.seatActionFrameDivId).style.backgroundColor = "#cfc";
}



SeatHandler.prototype.setCurrentPlayerActionTimeout = function(pid, timeToAct) {

    var playerEntity = entityHandler.getEntityById(playerHandler.getPlayerEntityIdByPid(pid));
    var seatNr = playerEntity.state.seatId;

    playerEntity.state.actionStartTime = new Date().getTime();
    playerEntity.state.timeToAct = timeToAct;
    var seatEntity = entityHandler.getEntityById(this.getSeatEntityIdBySeatNumber(seatNr));

    this.setCurrentActingSeatEntity(seatEntity)



    console.log(seatEntity);



}

SeatHandler.prototype.getPidByOccupiedSeatNumber = function(occupiedSeatNr) {
    console.log(occupiedSeatNr);
    var seatEntity = entityHandler.getEntityById("seat_nr_"+occupiedSeatNr);
    console.log(seatEntity);
    var playerEntityId = seatEntity.occupant.id;
    var playerEntity = entityHandler.getEntityById(playerEntityId);
    var pid = playerEntity.pid;
    return pid;
};

SeatHandler.prototype.createSeatNumberOnTableEntityAtXY = function(seatNr, tableEntity, x, y) {
    var seatEntity = entityHandler.addEntity(this.getSeatEntityIdBySeatNumber(seatNr));

    entityHandler.addUiComponent(seatEntity, "", "poker_seat_box", null);

    console.log(seatEntity)

    var seatBoxDivId = seatEntity.ui.divId;



    entityHandler.addSpatial(tableEntity.ui.divId, seatEntity, x, y);



    var playerPoint = {posX: 50, posY:0};
    var cardsPoint = {posX:50, posY:50};
    var dealerButtonPoint = {posX: 97, posY:77};
    var betStackPoint = {posX: 70, posY: 100};
    var balancePoint = {posX:30, posY:100};
    var playerTimer = {posX: 15, posY:50};
    var playerAction = {posX: 92, posY:20};

    var seatAttachmentPoints = {
        player:{transform:playerPoint},
        cards:{transform:cardsPoint},
        dealerButton:{transform:dealerButtonPoint},
        betStack:{transform:betStackPoint},
        balance:{transform:balancePoint},
        playerTimer:{transform:playerTimer},
        playerAction:{transform:playerAction}
    };
    seatEntity.spatial.attachmentPoints = seatAttachmentPoints;
    uiElementHandler.setDivElementParent(seatEntity.ui.divId, seatEntity.spatial.transform.anchorId);
    this.addBalanceFieldToSeat(seatEntity);
    this.addCardFieldToSeat(seatEntity);
    this.addPlacedBetFieldToSeat(seatEntity);
    this.addDealerButtonFieldToSeat(seatEntity);
    this.addPlayerTimerProgressBar(seatEntity);
    this.addPlayerActionIndicator(seatEntity);

    this.removePlayerFromSeat(seatEntity)

    return seatEntity;

};

SeatHandler.prototype.addPlayerActionIndicator = function(seatEntity) {
    var uiEntity = entityHandler.addEntity(seatEntity.id+"_seatActionUi");
    entityHandler.addUiComponent(uiEntity, "", "seat_element_frame", null);

    document.getElementById(uiEntity.ui.divId).style.width = 36+"px";
    document.getElementById(uiEntity.ui.divId).style.height = 36+"px";
    document.getElementById(uiEntity.ui.divId).style.left = -18+"px";
    document.getElementById(uiEntity.ui.divId).style.top = -18+"px";

    var posX = seatEntity.spatial.attachmentPoints.playerAction.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.playerAction.transform.posY;

	seatEntity.ui.seatActionFrameDivId = uiEntity.ui.divId;
    seatEntity.ui.seatActionSlotDivId = uiEntity.ui.divId+"_slot";

    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);

    uiElementHandler.createDivElement(uiEntity.ui.divId, seatEntity.ui.seatActionSlotDivId, "", "seat_turn_state_passive", null);

};

SeatHandler.prototype.addPlayerTimerProgressBar = function(seatEntity) {
    var uiEntity = entityHandler.addEntity(seatEntity.id+"_timeProgressUi");
    entityHandler.addUiComponent(uiEntity, "", "seat_timer_frame", null);


    var posX = seatEntity.spatial.attachmentPoints.playerTimer.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.playerTimer.transform.posY;

    seatEntity.ui.timeProgressBarFrameDivId = uiEntity.ui.divId;

    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);

    seatEntity.ui.timeProgressBarDivId = uiEntity.ui.divId+"TimeProgress";
    uiElementHandler.createDivElement(seatEntity.ui.timeProgressBarFrameDivId, seatEntity.ui.timeProgressBarDivId, "", "standing_progressbar", null);

};

SeatHandler.prototype.addDealerButtonFieldToSeat = function(seatEntity) {

    var uiEntity = entityHandler.addEntity(seatEntity.id+"_dealerButtonUi");
    entityHandler.addUiComponent(uiEntity, "", "anchor", null);

    document.getElementById(uiEntity.ui.divId).style.width = 46+"px";
    document.getElementById(uiEntity.ui.divId).style.height = 46+"px";
    document.getElementById(uiEntity.ui.divId).style.left = -23+"px";
    document.getElementById(uiEntity.ui.divId).style.top = -23+"px";

    var posX = seatEntity.spatial.attachmentPoints.dealerButton.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.dealerButton.transform.posY;

	seatEntity.ui.dealerButtonDivId = uiEntity.ui.divId;

    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);

    seatEntity.ui.dealerButtonSlotDivId = uiEntity.ui.divId+"_slot";
    uiElementHandler.createDivElement(uiEntity.ui.divId, seatEntity.ui.dealerButtonSlotDivId, "", "anchor", null);


};



SeatHandler.prototype.addPlacedBetFieldToSeat = function(seatEntity) {

    var uiEntity = entityHandler.addEntity(seatEntity.id+"_betFieldUi");
    entityHandler.addUiComponent(uiEntity, "", "player_balance", null);

    var posX = seatEntity.spatial.attachmentPoints.betStack.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.betStack.transform.posY;
	seatEntity.ui.betFieldDivId = uiEntity.ui.divId;
	
    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);
};

SeatHandler.prototype.addBalanceFieldToSeat = function(seatEntity) {
    var uiEntity = entityHandler.addEntity(seatEntity.id+"_balanceUi");
    entityHandler.addUiComponent(uiEntity, "", "player_balance", null);

    var posX = seatEntity.spatial.attachmentPoints.balance.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.balance.transform.posY;
	seatEntity.ui.balanceDivId = uiEntity.ui.divId;

    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);
};

SeatHandler.prototype.getCardFieldIdBySeatId = function(seatEntityId) {
    return seatEntityId+"_cardFieldUi";
};

SeatHandler.prototype.addCardFieldToSeat = function(seatEntity) {
    var cardBoxId = this.getCardFieldIdBySeatId(seatEntity.id);
    var uiEntity = entityHandler.addEntity(cardBoxId);
    entityHandler.addUiComponent(uiEntity, "", "card_area", null);

    var posX = seatEntity.spatial.attachmentPoints.cards.transform.posX;
    var posY = seatEntity.spatial.attachmentPoints.cards.transform.posY;

    seatEntity.ui.cardFieldDivId = uiEntity.ui.divId
    entityHandler.addSpatial("body", uiEntity, posX, posY);
    uiElementHandler.setDivElementParent(uiEntity.ui.divId, uiEntity.spatial.transform.anchorId);
    uiElementHandler.setDivElementParent(uiEntity.spatial.transform.anchorId, seatEntity.ui.divId);
    view.spatialManager.positionVisualEntityAtSpatial(uiEntity);
};

SeatHandler.prototype.addPlayerToSeat = function(playerEntity, seatEntity) {
    document.getElementById(seatEntity.spatial.transform.anchorId).style.opacity = 1;

    if (playerEntity.pid == playerHandler.myPlayerPid) {
        console.log("Adding Self to Seat")
        document.getElementById(playerEntity.ui.divId).className = "my_player_nameplate";
    }

    uiElementHandler.setDivElementParent(playerEntity.spatial.transform.anchorId, seatEntity.ui.divId);
};

SeatHandler.prototype.setSeatTimerPercentRemaining = function(seatEntity, percent) {
    document.getElementById(seatEntity.ui.timeProgressBarDivId).style.height = percent+"%";

};

SeatHandler.prototype.updateActiveSeatTimer = function(currentTime) {
    if (!this.activeSeatEntity) return;
    var playerEntity = this.activeSeatEntity.occupant
    var percentRemaining = playerHandler.getPlayerEntityActionTimePercentRemaining(playerEntity, currentTime)

    this.setSeatTimerPercentRemaining(this.activeSeatEntity, percentRemaining)

    if (percentRemaining < 0) {
        this.setSeatEntityToPassive(this.activeSeatEntity);
        this.activeSeatEntity = null;
    };
};



SeatHandler.prototype.tick = function(currentTime) {
    this.updateActiveSeatTimer(currentTime)
};

