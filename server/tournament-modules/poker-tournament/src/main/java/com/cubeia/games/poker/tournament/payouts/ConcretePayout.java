/**
 * Copyright (C) 2012 Cubeia Ltd <info@cubeia.com>
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

package com.cubeia.games.poker.tournament.payouts;

public class ConcretePayout {
    private final int playerId;
    private final int position;
    private int payoutInCents;

    public ConcretePayout(int playerId, int position, int payoutInCents) {
        this.playerId = playerId;
        this.position = position;
        this.payoutInCents = payoutInCents;
    }

    public int getPlayerId() {
        return playerId;
    }

    public int getPosition() {
        return position;
    }

    public int getPayoutInCents() {
        return payoutInCents;
    }

    public void setPayoutInCents(int payoutInCents) {
        this.payoutInCents = payoutInCents;
    }
}