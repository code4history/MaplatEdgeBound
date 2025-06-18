# 拡張仕様

EdgeBoundは、[Delaunator](https://github.com/mapbox/delaunator)を三角網生成エンジンとして、様々な制約を含んだ三角網を実現する。

## 当初機能

Delaunator出力を受け取り、必須エッジ制約付き三角分割を生成

### コアコンポーネント

#### BitSet実装 (src/common/bitset.ts)

* 効率的なビット操作を行うためのデータ構造を提供
* 8bit、16bit、32bitの3つの実装を持つ
* 三角形の辺の制約管理に使用される

#### Constrain実装 (src/variant/constrain.ts)

* 既存の三角分割への指定した必須エッジを追加
* 交差するエッジの検出と除去
* ドロネー条件の維持

#### オリジナル
[@kninnug/constrainautor](https://github.com/kninnug/Constrainautor/) 4.0.0 から改変して開発

### 原理
* 制約を付するアルゴリズムは次の論文を参考にした: [A fast algorithm for generating constrained Delaunay triangulations](https://web.archive.org/web/20210506140628if_/https://www.newcastle.edu.au/__data/assets/pdf_file/0019/22519/23_A-fast-algortithm-for-generating-constrained-Delaunay-triangulations.pdf), 1992, S. W. Sloan.

#### 基本的なアプローチ

* まず単純な非制約ドロネー三角分割を構築
* その後、指定された必須エッジの制約を強制的に追加
* 必須エッジと交差する既存の辺を検出して除去
* 必須エッジを維持しながら、可能な限りドロネー条件を満たすように最適化
* 追加点なしで制約を満たすことが可能
* 複数の必須エッジが交差する場合はエラー

#### パフォーマンス特性

* 点数Nに対してほぼ線形の実行時間(O(N))を実現
* ビンソートを活用して検索効率を向上
* 制約付加による追加コストは通常10%未満

## [拡張計画1](./extend1.md) (2024/12)