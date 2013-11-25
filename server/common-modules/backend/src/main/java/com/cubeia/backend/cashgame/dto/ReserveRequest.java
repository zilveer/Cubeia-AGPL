/**
 * Copyright (C) 2010 Cubeia Ltd <info@cubeia.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.cubeia.backend.cashgame.dto;

import com.cubeia.backend.cashgame.PlayerSessionId;
import com.cubeia.games.poker.common.Money;

import java.io.Serializable;

@SuppressWarnings("serial")
public class ReserveRequest implements Serializable {

    private final PlayerSessionId playerSessionId;
    private final int roundNumber;
    private final Money amount;

    public ReserveRequest(PlayerSessionId playerSessionId, int roundNumber, Money amount) {
        this.playerSessionId = playerSessionId;
        this.roundNumber = roundNumber;
        this.amount = amount; 
    }

    public PlayerSessionId getPlayerSessionId() {
        return playerSessionId;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public Money getAmount() {
        return amount;
    }
}