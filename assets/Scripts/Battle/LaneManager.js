cc.Class({
    extends: cc.Component,

    properties: {
        laneList: [cc.Node],
    },

    start() {
    },

    initLane() {
        for (let i = 0; i < this.lockedLane.length; i++) {
            let laneIndex = this.lockedLane[i];

            if (this.laneList[laneIndex]) {
                let sprite = this.laneList[laneIndex].getComponent(cc.Sprite);

                if (sprite) {
                    sprite.node.color = cc.Color.BLACK;
                }
            }
        }
    },

    returnListSpawn() {
        let listSpawn = [];
        for (let node of this.laneList) {
            let localPos = cc.v2(node.width / 2, Math.round(-node.height / 2) / 2);

            let worldPos = node.convertToWorldSpaceAR(localPos);
            listSpawn.push(worldPos);
        }
        return listSpawn;
    },



});
