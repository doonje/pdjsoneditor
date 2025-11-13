pipeline {
    agent any

    // master 브랜치 푸시 시 자동 트리거
    triggers {
        githubPush()
    }

    environment {
        // Docker Hub 설정
        DOCKER_HUB_USERNAME = credentials('DOCKER_HUB_USERNAME')
        DOCKER_HUB_TOKEN = credentials('DOCKER_HUB_TOKEN')
        DOCKER_IMAGE = 'doonje/dev-utils'

        // Slack 웹훅
        SLACK_WEBHOOK = credentials('SLACK_WEBHOOK')

        // Node.js 버전
        NODE_VERSION = '20'
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Prepare Build Info') {
            steps {
                script {
                    echo "🔍 Setting up build information..."

                    // Git 정보 추출 (Jenkins가 이미 체크아웃 완료)
                    env.GIT_COMMIT = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()

                    // 브랜치명 추출 (detached HEAD 상태 처리)
                    def branchName = sh(
                        returnStdout: true,
                        script: "git symbolic-ref --short HEAD 2>/dev/null || echo 'detached'"
                    ).trim()

                    // detached HEAD인 경우 (Jenkins 기본 동작) origin/main 에서 브랜치명 추출
                    if (branchName == 'detached') {
                        branchName = sh(
                            returnStdout: true,
                            script: "git branch -r --contains HEAD | grep origin | head -1 | sed 's|origin/||' | xargs"
                        ).trim()
                    }

                    env.GIT_BRANCH = branchName ?: 'unknown'

                    // 빌드 번호와 커밋 해시를 조합한 버전 태그 생성
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"

                    echo "✅ Build information:"
                    echo "  Branch: ${env.GIT_BRANCH}"
                    echo "  Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "  Image Tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image for AMD64..."

                    sh '''
                        export DOCKER_CONFIG="${WORKSPACE}/.docker"
                        mkdir -p "${DOCKER_CONFIG}"

                        # Buildx 로컬 설치 경로
                        BUILDX_DIR="${WORKSPACE}/.buildx-cache"
                        mkdir -p "${BUILDX_DIR}"

                        # Buildx 다운로드 (캐싱)
                        if [ ! -f "${BUILDX_DIR}/docker-buildx" ]; then
                            echo "📦 Downloading buildx..."
                            curl -sSL https://github.com/docker/buildx/releases/download/v0.18.0/buildx-v0.18.0.linux-amd64 \
                              -o "${BUILDX_DIR}/docker-buildx"
                            chmod +x "${BUILDX_DIR}/docker-buildx"
                            echo "✅ Buildx downloaded"
                        else
                            echo "✅ Using cached buildx"
                        fi

                        BUILDX="${BUILDX_DIR}/docker-buildx"

                        echo "🔐 Logging in to Docker Hub..."
                        echo $DOCKER_HUB_TOKEN | DOCKER_CONFIG="${DOCKER_CONFIG}" docker login -u $DOCKER_HUB_USERNAME --password-stdin

                        echo "⚙️ Setting up QEMU..."
                        docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

                        echo "🔧 Creating/using builder..."
                        "${BUILDX}" create --use --name pdjsoneditor-builder --driver docker-container 2>/dev/null || "${BUILDX}" use pdjsoneditor-builder

                        echo "🚀 Building AMD64 image..."
                        "${BUILDX}" build \
                          --platform linux/amd64 \
                          --tag ${DOCKER_IMAGE}:${IMAGE_TAG} \
                          --tag ${DOCKER_IMAGE}:latest \
                          --cache-from type=registry,ref=${DOCKER_IMAGE}:buildcache \
                          --cache-to type=registry,ref=${DOCKER_IMAGE}:buildcache,mode=max \
                          --build-arg BUILDKIT_INLINE_CACHE=1 \
                          --push \
                          .

                        echo "✅ Docker image pushed successfully"
                        echo "Images:"
                        echo "  - ${DOCKER_IMAGE}:${IMAGE_TAG}"
                        echo "  - ${DOCKER_IMAGE}:latest"
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "🧹 Cleaning up..."
                sh 'docker logout || true'
                cleanWs()
            }
        }

        success {
            script {
                echo "✅ Build succeeded!"

                def imageTag = env.IMAGE_TAG ?: 'unknown'
                def gitCommit = env.GIT_COMMIT_SHORT ?: 'unknown'
                def gitBranch = env.GIT_BRANCH ?: 'unknown'
                def buildUrl = env.BUILD_URL ?: 'Jenkins'
                def buildNumber = env.BUILD_NUMBER ?: 'unknown'

                sh """#!/bin/bash
                    curl -X POST -H 'Content-type: application/json' \
                      --data '{
                        "text": "✅ *PDJsonEditor 빌드 성공*",
                        "blocks": [
                          {
                            "type": "header",
                            "text": {
                              "type": "plain_text",
                              "text": "✅ PDJsonEditor 빌드 성공"
                            }
                          },
                          {
                            "type": "section",
                            "fields": [
                              {
                                "type": "mrkdwn",
                                "text": "*프로젝트:*\\nPDJsonEditor"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*브랜치:*\\n${gitBranch}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*이미지 태그:*\\n${imageTag}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*커밋:*\\n${gitCommit}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*빌드:*\\n#${buildNumber}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*Docker 이미지:*\\ndoonje/dev-utils:${imageTag}"
                              }
                            ]
                          },
                          {
                            "type": "section",
                            "text": {
                              "type": "mrkdwn",
                              "text": "<${buildUrl}|빌드 로그 보기>"
                            }
                          },
                          {
                            "type": "divider"
                          },
                          {
                            "type": "context",
                            "elements": [
                              {
                                "type": "mrkdwn",
                                "text": "🐳 Docker Hub: <https://hub.docker.com/r/doonje/dev-utils|doonje/dev-utils>"
                              }
                            ]
                          }
                        ]
                      }' \
                      "${SLACK_WEBHOOK}" || echo "Slack notification failed"
                """
            }
        }

        failure {
            script {
                echo "❌ Build failed!"

                def imageTag = env.IMAGE_TAG ?: 'unknown'
                def gitCommit = env.GIT_COMMIT_SHORT ?: 'unknown'
                def gitBranch = env.GIT_BRANCH ?: 'unknown'
                def buildUrl = env.BUILD_URL ?: 'Jenkins'
                def buildNumber = env.BUILD_NUMBER ?: 'unknown'

                sh """#!/bin/bash
                    curl -X POST -H 'Content-type: application/json' \
                      --data '{
                        "text": "❌ *PDJsonEditor 빌드 실패*",
                        "blocks": [
                          {
                            "type": "header",
                            "text": {
                              "type": "plain_text",
                              "text": "❌ PDJsonEditor 빌드 실패"
                            }
                          },
                          {
                            "type": "section",
                            "fields": [
                              {
                                "type": "mrkdwn",
                                "text": "*프로젝트:*\\nPDJsonEditor"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*브랜치:*\\n${gitBranch}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*이미지 태그:*\\n${imageTag}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*커밋:*\\n${gitCommit}"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*빌드:*\\n#${buildNumber}"
                              }
                            ]
                          },
                          {
                            "type": "section",
                            "text": {
                              "type": "mrkdwn",
                              "text": "⚠️ *즉시 확인이 필요합니다*\\n<${buildUrl}console|빌드 로그 확인하기>"
                            }
                          }
                        ]
                      }' \
                      "${SLACK_WEBHOOK}" || echo "Slack notification failed"
                """
            }
        }
    }
}
