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
        skipDefaultCheckout()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 Checking out repository..."

                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/master']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [
                            [$class: 'CleanBeforeCheckout'],
                            [$class: 'CloneOption', depth: 0, noTags: false, shallow: false]
                        ],
                        submoduleCfg: [],
                        userRemoteConfigs: [[
                            url: scm.userRemoteConfigs[0].url,
                            credentialsId: 'github-personal-access-token'
                        ]]
                    ])

                    env.GIT_COMMIT = sh(returnStdout: true, script: "git rev-parse HEAD").trim()
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()

                    echo "✅ Checkout complete"
                    echo "Commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Version Bump') {
            steps {
                script {
                    echo "📦 Bumping version automatically..."

                    // Git 설정
                    sh '''
                        git config user.email "jenkins@pdjsoneditor.com"
                        git config user.name "Jenkins CI"
                    '''

                    // 의존성 설치 (standard-version 필요)
                    sh 'npm ci'

                    // 현재 버전 확인
                    def currentVersion = sh(
                        script: "node -p \"require('./package.json').version\"",
                        returnStdout: true
                    ).trim()
                    echo "Current version: ${currentVersion}"

                    // standard-version으로 패치 버전 자동 증가
                    sh 'npx standard-version'

                    // 새 버전 확인
                    def newVersion = sh(
                        script: "node -p \"require('./package.json').version\"",
                        returnStdout: true
                    ).trim()

                    env.APP_VERSION = newVersion
                    echo "✅ New version: ${env.APP_VERSION}"

                    // Git push (버전 업데이트 및 태그)
                    withCredentials([usernamePassword(
                        credentialsId: 'github-personal-access-token',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_PASSWORD'
                    )]) {
                        sh '''
                            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${GIT_USERNAME}/pdjsoneditor.git HEAD:master
                            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/${GIT_USERNAME}/pdjsoneditor.git --tags
                        '''
                    }

                    echo "✅ Version bump and tag pushed to repository"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image for ARM64..."

                    sh '''
                        export DOCKER_CONFIG="${WORKSPACE}/.docker"
                        mkdir -p "${DOCKER_CONFIG}"

                        # Buildx 로컬 설치 경로
                        BUILDX_DIR="${WORKSPACE}/.buildx-cache"
                        mkdir -p ${BUILDX_DIR}

                        # Buildx 다운로드 (캐싱)
                        if [ ! -f "${BUILDX_DIR}/docker-buildx" ]; then
                            echo "📦 Downloading buildx..."
                            curl -sSL https://github.com/docker/buildx/releases/download/v0.18.0/buildx-v0.18.0.linux-amd64 \
                              -o ${BUILDX_DIR}/docker-buildx
                            chmod +x ${BUILDX_DIR}/docker-buildx
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
                        ${BUILDX} create --use --name pdjsoneditor-builder --driver docker-container 2>/dev/null || ${BUILDX} use pdjsoneditor-builder

                        echo "🚀 Building ARM64 image..."
                        ${BUILDX} build \
                          --platform linux/arm64 \
                          --tag ${DOCKER_IMAGE}:${APP_VERSION} \
                          --tag ${DOCKER_IMAGE}:latest \
                          --cache-from type=registry,ref=${DOCKER_IMAGE}:buildcache \
                          --cache-to type=registry,ref=${DOCKER_IMAGE}:buildcache,mode=max \
                          --build-arg BUILDKIT_INLINE_CACHE=1 \
                          --push \
                          .

                        echo "✅ Docker image pushed successfully"
                        echo "Images:"
                        echo "  - ${DOCKER_IMAGE}:${APP_VERSION}"
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

                def appVersion = env.APP_VERSION ?: 'unknown'
                def gitCommit = env.GIT_COMMIT_SHORT ?: 'unknown'
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
                                "text": "*브랜치:*\\nmaster"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*버전:*\\nv${appVersion}"
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
                                "text": "*Docker 이미지:*\\ndoonje/dev-utils:${appVersion}"
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

                def appVersion = env.APP_VERSION ?: 'unknown'
                def gitCommit = env.GIT_COMMIT_SHORT ?: 'unknown'
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
                                "text": "*브랜치:*\\nmaster"
                              },
                              {
                                "type": "mrkdwn",
                                "text": "*버전:*\\n${appVersion}"
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
