# 使用正式环境已验证的原生依赖，只替换从本 fork 源码构建的应用产物。
# 构建前必须核对基底镜像 ID，见同目录 README。
FROM mtranserver:5.1.0-local.1
ARG SOURCE_REVISION
COPY dist/ /app/
RUN node --check /app/main.js
LABEL org.opencontainers.image.source="https://github.com/QuickerOrg/MTranServer" \
      org.opencontainers.image.revision="${SOURCE_REVISION}" \
      quicker.fixes="bounded-initialization-probe,norwegian-aliases,bad-request-status"
