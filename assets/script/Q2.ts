

class CheckSumUtil {
    /**
        时间复杂度：O(n + m)，其中 n 是数组 a 的长度，m 是数组 b 的长度。
        将数组 b 转换为集合 Set 需要 O(m) 时间。
        遍历数组 a 并检查补数是否存在需要 O(n) 时间。
        集合的查找操作平均时间复杂度为 O(1)。
        空间复杂度分析：
        空间复杂度：O(m)，用于存储数组 b 元素的集合。
     */

    static checkSumExists(a: number[], b: number[], v: number): boolean {
        const setB = new Set(b);
        for (const num of a) {
            const complement = v - num;
            if (setB.has(complement)) {
                return true;
            }
        }
        return false;
    }
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class Q2 extends cc.Component{
    onLoad() {
        let a = [10, 40, 5, 280];
        let b = [234, 5, 2, 148, 23];
        let v = 42;
        console.log(`checkSumExists:${CheckSumUtil.checkSumExists(a,b,v)}`);
    }
}
