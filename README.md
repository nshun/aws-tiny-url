# AWS で作る URL 短縮サービス

- 使用サービス
  - API Gateway, DynamoDB
- 使用言語、フレームワーク
  - Typescript, CDK, React, Vite, Cloudscape

## 構築してテストする

1. バックエンドをデプロイ

```
cd backend/
cdk deploy
```

_出力から API エンドポイント名をコピー_

2. API エンドポイントを設定

   - `frontend/src/config.ts` の API_ENDPOINT をコピーした値に編集

3. フロントエンドをローカル実行

```
cd frontend/
pnpm install
pnpm run dev
```

4. ブラウザが開くのでアクセスしてテストする

## (オプション) 公開する

1. フロントエンドをビルド

```
cd frontend/
pnpm run build
```

2. ビルドされたファイルを S3 などに配置して公開

## 削除

```
cd backend/
cdk destroy
```
