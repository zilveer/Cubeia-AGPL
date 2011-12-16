package com.cubeia.poker.blinds;

import static com.cubeia.poker.blinds.Fixtures.blindsInfo;
import static com.cubeia.poker.blinds.Fixtures.players;

import java.util.Arrays;
import java.util.List;

import com.cubeia.poker.blinds.BlindsCalculator;
import com.cubeia.poker.blinds.BlindsInfo;
import com.cubeia.poker.blinds.BlindsPlayer;
import com.cubeia.poker.blinds.MissedBlind;
import com.cubeia.poker.blinds.MissedBlindsStatus;
import com.cubeia.poker.blinds.utils.MockPlayer;


import junit.framework.TestCase;

public class MissedBlindsTest extends TestCase {

	private BlindsCalculator calc;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		calc = new BlindsCalculator();
	}	
	
	public void testSmallBlindMarkedAsMissedSmallIfSittingOut() {
		// Given
		BlindsInfo blinds = blindsInfo(1, 2, 3);
		List<BlindsPlayer> players = players(1, 2, 3, 4);
		sitOut(players, 3); // Small blind is sitting out.
		
		// When
		calc.initializeBlinds(blinds, players);
		
		// Then
		List<MissedBlind> missedBlinds = calc.getMissedBlinds();
		assertEquals(MissedBlindsStatus.MISSED_SMALL_BLIND, missedBlinds.get(0).getMissedBlindsStatus());
	}	

	private void sitOut(List<BlindsPlayer> players, int ... seatIds) {
		for (int seatId : seatIds) {
			MockPlayer player = getPlayerInSeat(players, seatId);
			player.setSittingIn(false);
			player.setMissedBlindsStatus(MissedBlindsStatus.NO_MISSED_BLINDS);
		}
	}
	
	private MockPlayer getPlayerInSeat(List<BlindsPlayer> players, int seatId) {
		for (BlindsPlayer player : players) {
			if (player.getSeatId() == seatId) {
				return (MockPlayer) player;
			}
		}
		return null;
	}

	public void testMarkPlayersBetweenOldAndNewDealerButtonAsMissesBig() {
		// Given
		BlindsInfo blinds = blindsInfo(1, 4, 5);
		List<BlindsPlayer> players = players(1, 2, 3, 4, 5, 6, 7);
		sitOut(players, 2, 3, 4, 5); // Players 2, 3, 4 and 5 sit out.
		
		// When
		calc.initializeBlinds(blinds, players);
		
		// Then
		List<MissedBlind> missedBlinds = calc.getMissedBlinds();
		assertEquals(3, missedBlinds.size());
		assertEquals(MissedBlindsStatus.MISSED_SMALL_BLIND, missedBlinds.get(0).getMissedBlindsStatus());
		assertEquals(MissedBlindsStatus.MISSED_BIG_AND_SMALL_BLIND, missedBlinds.get(1).getMissedBlindsStatus());
		assertEquals(MissedBlindsStatus.MISSED_BIG_AND_SMALL_BLIND, missedBlinds.get(2).getMissedBlindsStatus());
		
		// Note, player in seat 4 is now on the dealer button, but sitting out. He did not miss any blinds.
	}
		
	public void testMarkPlayersBetweenSmallAndBigAsMissedBig() {
		// Given
		BlindsInfo blinds = blindsInfo(5, 6, 1);
		List<BlindsPlayer> players = players(1, 2, 3, 4, 5, 6);
		sitOut(players, 2, 3, 4); // Players 2, 3, 4 and 5 sit out.
		
		// When
		calc.initializeBlinds(blinds, players);
		
		// Then
		List<MissedBlind> missedBlinds = calc.getMissedBlinds();
		assertEquals(3, missedBlinds.size());
		assertEquals(MissedBlindsStatus.MISSED_BIG_AND_SMALL_BLIND, missedBlinds.get(0).getMissedBlindsStatus());
		assertEquals(MissedBlindsStatus.MISSED_BIG_AND_SMALL_BLIND, missedBlinds.get(1).getMissedBlindsStatus());
		assertEquals(MissedBlindsStatus.MISSED_BIG_AND_SMALL_BLIND, missedBlinds.get(2).getMissedBlindsStatus());
	}
	
	public void testGetEligiblePlayerList() {
		// Given
		BlindsInfo blinds = blindsInfo(5, 6, 1);
		List<BlindsPlayer> players = players(1, 2, 3, 4, 5, 6);
		sitOut(players, 2, 3, 4); // Players 2, 3, 4 and 5 sit out.
		calc.initializeBlinds(blinds, players);
		
		// When
		List<BlindsPlayer> eligiblePlayerList = calc.getEligiblePlayerList();
		
		// Then
		assertEquals(Arrays.asList(players.get(4), players.get(5)), eligiblePlayerList);
	}	

}
