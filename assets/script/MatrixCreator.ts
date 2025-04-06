const { ccclass, property } = cc._decorator;

@ccclass
export default class MatrixGenerator extends cc.Component {
    @property(cc.EditBox)
    xInput: cc.EditBox = null;

    @property(cc.EditBox)
    yInput: cc.EditBox = null;

    @property(cc.Button)
    generateButton: cc.Button = null;

    @property(cc.Node)
    matrixContainer: cc.Node = null;

    @property(cc.Prefab)
    cellPrefab: cc.Prefab = null;

    @property([cc.Color])
    colors: cc.Color[] = []; // 设置5种颜色

    private readonly GRID_SIZE: number = 50;
    private readonly SPACING: number = 2;
    private readonly STARTX: number = -(this.GRID_SIZE * 5) + (this.GRID_SIZE + this.SPACING) / 2;
    private readonly STARTY: number = (this.GRID_SIZE * 5) - (this.GRID_SIZE + this.SPACING) / 2;

    onLoad() {
        this.generateButton.node.on("click", this.generateMatrix, this);
    }

    generateMatrix() {
        const X = parseFloat(this.xInput.string) || 0;
        const Y = parseFloat(this.yInput.string) || 0;

        const matrix = this.generateColorMatrix(X, Y);
        this.renderMatrix(matrix);
    }

    private generateColorMatrix(X: number, Y: number): number[][] {
        const matrix: number[][] = [];
        for (let i = 0; i < 10; i++) matrix[i] = new Array(10).fill(-1);

        // 初始化第一个点
        matrix[0][0] = Math.floor(Math.random() * 5);

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (i === 0 && j === 0) continue;

                const leftColor = j > 0 ? matrix[i][j - 1] : undefined;
                const upColor = i > 0 ? matrix[i - 1][j] : undefined;

                let prob = [20, 20, 20, 20, 20];

                if (leftColor !== undefined && upColor !== undefined) {
                    if (leftColor === upColor) {
                        prob[leftColor] += Y;
                        const remaining = 100 - prob[leftColor];
                        for (let k = 0; k < 5; k++) {
                            if (k !== leftColor) prob[k] = remaining / 4;
                        }
                    } else {
                        prob[leftColor] += X;
                        prob[upColor] += X;
                        const remaining = 100 - (prob[leftColor] + prob[upColor]);
                        const others = [0, 1, 2, 3, 4].filter(
                            (c) => c !== leftColor && c !== upColor
                        );
                        others.forEach((c) => (prob[c] = remaining / others.length));
                    }
                } else if (leftColor !== undefined) {
                    prob[leftColor] += X;
                    const remaining = 100 - prob[leftColor];
                    for (let k = 0; k < 5; k++) {
                        if (k !== leftColor) prob[k] = remaining / 4;
                    }
                } else if (upColor !== undefined) {
                    prob[upColor] += X;
                    const remaining = 100 - prob[upColor];
                    for (let k = 0; k < 5; k++) {
                        if (k !== upColor) prob[k] = remaining / 4;
                    }
                }
                matrix[i][j] = this.selectColor(prob);
            }
        }
        return matrix;
    }

    private selectColor(prob: number[]): number {
        // 负数置0
        const normalized = prob.map(v => Math.max(0, v));
        const total = normalized.reduce((a, b) => a + b, 0);
        const rand = Math.random() * total;
        let accum = 0;
        for (let i = 0; i < normalized.length; i++) {
            accum += normalized[i];
            if (rand < accum) return i;
        }
        return 4;
    }
    private renderMatrix(matrix: number[][]) {
        this.matrixContainer.removeAllChildren();

        matrix.forEach((row, rowIdx) => {
            row.forEach((colorIdx, colIdx) => {
                const cell = cc.instantiate(this.cellPrefab);
                const sprite = cell.getComponent(cc.Sprite);
                sprite.node.color = this.colors[colorIdx];
                
                cell.x = this.STARTX + colIdx * (this.GRID_SIZE + this.SPACING);
                cell.y = this.STARTY - rowIdx * (this.GRID_SIZE + this.SPACING);
                
                this.matrixContainer.addChild(cell);
            });
        });
    }
}

