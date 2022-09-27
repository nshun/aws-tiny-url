# AWS で作る URL 短縮サービス

- 使用サービス
  - API Gateway, DynamoDB
  - (オプション) CloudFront, S3
- 使用言語、フレームワーク
  - Node.js, Typescript, pnpm
  - CDK, React, Vite, Cloudscape

## 構築してテストする

1. 依存パッケージをインストール

```
pnpm install
```

2. バックエンドをデプロイ

```
cd backend/
cdk deploy
```

_出力から API エンドポイント名をコピー_

3. API エンドポイントを設定

   - `frontend/src/config.ts` の API_ENDPOINT をコピーした値に編集

4. フロントエンドをローカル実行

```
cd frontend/
pnpm run dev
```

5. ブラウザが開くのでアクセスしてテストする

## (オプション) 公開する

1. フロントエンドをビルド

```
cd frontend/
pnpm run build
```

2. S3 に配置して CloudFront で公開

```
cd hosting
cdk deploy
```

## 削除

```
cd backend/
cdk destroy

cd hosting/
cdk destroy
```
