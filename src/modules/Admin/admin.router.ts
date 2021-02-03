import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppMembersComponent} from "./components/app-members/app-members.component";
import {AppUsersResolver} from "./resolvers/app-users.resolver";
import {AdminRoutes} from "./admin.routes";
import {AuthGuard} from "@app/services/auth/auth.guard";
import {RoleGuard} from "@app/services/role/role.guard";
import {Roles} from "@app/models/auth/auth.models";
import {EventConsolidatorComponent} from "./components/event-consolidator/event-consolidator.component";
import {EventConsolidatorResolver} from "./resolvers/event-consolidator.resolver";
import {ThreadManagerComponent} from "./components/chat/thread-manager/thread-manager.component";
import {NotificationsComponent} from "./components/notifications/notifications.component";
import {SystemNotificationsResolver} from "./resolvers/system-notifications.resolver";
import {ThreadsResolver} from "./resolvers/threads.resolver";
import {AppRoutes} from "AppRoutes";
import {SystemMonitoringComponent} from "./components/system-monitoring/system-monitoring.component";
import {ThreadDetailsResolver} from "./resolvers/thread-details.resolver";
import {IframeContainerComponent} from "./components/system-monitoring/iframe-container/iframe-container.component";
import {AppConfigService} from "@app/services/app.config.service";
import {ServicesHealthCheckComponent} from "./components/system-monitoring/services-health-check/services-health-check.component";
import {EventsLogComponent} from "./components/system-monitoring/events-log/events-log.component";
import {MarkdownInputResolver} from "@app/resolvers/markdown-input.resolver";
import {ThreadMessagesComponent} from "./components/chat/thread-messages/thread-messages.component";
import {ThreadMembersComponent} from "./components/chat/thread-members/thread-members.component";
import {ThreadBannedMembersResolver} from "./resolvers/thread-banned-members.resolver";
import {ThreadMembersResolver} from "./resolvers/thread-members.resolver";
import {ThreadMessagesResolver} from "./resolvers/thread-messages.resolver";
import {ForumComponent} from "./components/forum/forum.component";
import {QAComponent} from "./components/qa/qa.component";
import {ForumResolver} from "./resolvers/forum.resolver";
import {QAResolver} from "./resolvers/qa.resolver";
import {UiComponentsPermissionManagerComponent} from "./components/ui-permissions-manager/ui-components-permission-manager.component";
import {TagGuard} from "@app/services/role/tag.guard";
import {ComponentIdentifier} from "@app/models/app-config";
import {AdminPanelMainComponent} from "./components/admin-panel-main-page/admin-panel-main-component";
import {UIPermissionsResolver} from "./resolvers/permissions-manager.resolver";
import {NewsManagerComponent} from "./components/news-manager/news-manager.component";
import {NewsManagerResolver} from "./resolvers/news-manager.resolver";
import {CreateNewsComponent} from "./components/news-manager/create-news/create-news.component";
import {NewsResolver} from "./resolvers/news.resolver";
import {NewsListComponent} from "./components/news-manager/news-list/news-list.component";
import {EventsLogResolver} from "./resolvers/events-log.resolver";
import {RunningScriptsComponent} from "./components/running-scripts/running-scripts.component";
import {RunningScriptsResolver} from "./resolvers/running-scripts.resolver";
import {AdminComponent} from "./components/admin/admin.component";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {ForumCategoriesComponent} from "./components/forum-categories/forum-categories.component";
import {ForumCategoriesResolver} from "./resolvers/forum-categories.resolver";
import { XPDashboardComponent } from './components/xp-dashboard/xp-dashboard.component';
import { XPDashboardResolver } from './resolvers/xp-dashboard.resolver';
export const redirectUrl = `/${AppRoutes.Admin}`;

const SYSTEM_MONITORING_URLS = AppConfigService.config.systemMonitoringUrls;

export const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [AuthGuard],
        resolve: {
            assets: MarkdownInputResolver,
            userSettings: UserSettingsResolver,
        },
        children: [
            {
                path: AdminRoutes.AppMembers,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.appMembers,
                    redirectUrl: redirectUrl,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SupportOfficer,
                            Roles.KYCOfficer
                        ],
                        redirectUrl: `/${AppRoutes.Admin}`
                    },
                },
                children: [
                    {
                        path: '',
                        component: AppMembersComponent,
                        resolve: {
                            users: AppUsersResolver
                        }
                    }
                ]
            },
            {
                path: AdminRoutes.EventConsolidator,
                component: EventConsolidatorComponent,
                canActivate: [AuthGuard, RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.eventConsolidator,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.NewsOfficer,
                            Roles.Admin
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    events: EventConsolidatorResolver
                }
            },
            {
                path: AdminRoutes.Notifications,
                component: NotificationsComponent,
                canActivate: [AuthGuard, RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.adminNotifications,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.SupportOfficer,
                            Roles.SystemMonitoringOfficer,
                            Roles.Admin
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    notifications: SystemNotificationsResolver
                }
            },
            {
                path: AdminRoutes.Chat,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.adminChat,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SocialMediaOfficer
                        ],
                        redirectUrl: redirectUrl
                    }
                },
                children: [
                    {
                        path: '',
                        component: ThreadManagerComponent,
                        resolve: {
                            threadResults: ThreadsResolver
                        }
                    },
                    {
                        path: ':id/members',
                        component: ThreadMembersComponent,
                        resolve: {
                            bannedUsers: ThreadBannedMembersResolver,
                            users: ThreadMembersResolver
                        }
                    },
                    {
                        path: ':id/messages',
                        component: ThreadMessagesComponent,
                        resolve: {
                            threadDetails: ThreadDetailsResolver,
                            messages: ThreadMessagesResolver,
                        }
                    }
                ]
            },
            {
                path: `${AdminRoutes.News}`,
                component: NewsManagerComponent,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.adminNews,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                        ],
                        redirectUrl: redirectUrl
                    }
                },
                runGuardsAndResolvers: "always",
                resolve: {
                    news: NewsManagerResolver,
                },
                children: [
                    {
                        path: '',
                        component: NewsListComponent,
                    },
                    {
                        path: 'create',
                        component: CreateNewsComponent,
                    },
                    {
                        path: 'edit/:id',
                        component: CreateNewsComponent,
                        resolve: {
                            news: NewsResolver
                        }
                    }
                ]
            },
            {
                path: `${AdminRoutes.SystemMonitoring}`,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.systemMonitoring,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SystemMonitoringOfficer,
                        ],
                        redirectUrl: redirectUrl
                    }
                },
                component: SystemMonitoringComponent,
                children: [
                    {
                        path: '',
                        redirectTo: 'platform/services'
                    },
                    {
                        path: 'platform/services',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.platform.services,
                        },
                    },
                    {
                        path: 'platform/event-bus',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.platform.eventBus,
                        },
                    },
                    {
                        path: 'platform/performance',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.platform.performance,
                        },
                    },
                    {
                        path: 'exchange/services',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.exchange ?
                                SYSTEM_MONITORING_URLS.exchange.services : "",
                        },
                    },
                    {
                        path: 'exchange/event-bus',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.exchange ?
                                SYSTEM_MONITORING_URLS.exchange.eventBus : "",
                        },
                    },
                    {
                        path: 'exchange/performance',
                        component: IframeContainerComponent,
                        data: {
                            url: SYSTEM_MONITORING_URLS.exchange ?
                                SYSTEM_MONITORING_URLS.exchange.performance : "",
                        },
                    },
                    {
                        path: 'services',
                        component: ServicesHealthCheckComponent,
                    },
                    {
                        path: 'events-log',
                        component: EventsLogComponent,
                        resolve: {
                            logs: EventsLogResolver,
                        }
                    }
                ]
            },
            {
                path: `${AdminRoutes.Forum}/categories`,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    redirectUrl: redirectUrl,
                    identifier: ComponentIdentifier.adminForum,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SystemMonitoringOfficer,
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    resolvedData: ForumCategoriesResolver
                },
                component: ForumCategoriesComponent,
            },
            {
                path: `${AdminRoutes.Forum}/discussions`,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    redirectUrl: redirectUrl,
                    identifier: ComponentIdentifier.adminForum,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SystemMonitoringOfficer,
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    discussions: ForumResolver
                },
                component: ForumComponent,
            },
            {
                path: `${AdminRoutes.XPDashboard}`,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    redirectUrl: redirectUrl,
                    identifier: ComponentIdentifier.xpDashboard,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SupportOfficer,
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    discussions: XPDashboardResolver
                },
                component: XPDashboardComponent,
            },
            {
                path: `${AdminRoutes.QA}`,
                canActivate: [RoleGuard, TagGuard],
                data: {
                    identifier: ComponentIdentifier.adminQA,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin,
                            Roles.SystemMonitoringOfficer,
                        ],
                        redirectUrl: redirectUrl
                    }
                },
                resolve: {
                    questions: QAResolver
                },
                component: QAComponent,
            },
            {
                path: `${AdminRoutes.UIPermissionsManager}`,
                component: UiComponentsPermissionManagerComponent,
                data: {
                    identifier: ComponentIdentifier.permissionsManager,
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    permissionsData: UIPermissionsResolver
                }
            },
            {
                path: `${AdminRoutes.RunningScripts}`,
                component: RunningScriptsComponent,
                data: {
                    roleGuardConfig: {
                        allowedRoles: [
                            Roles.Admin
                        ],
                        redirectUrl: redirectUrl
                    },
                },
                resolve: {
                    runningScripts: RunningScriptsResolver
                }
            },
            {
                path: '',
                component: AdminPanelMainComponent,
            },
            // {
            //     path: '',
            //     canActivate: [RedirectByRoleGuard],
            //     data: {
            //         redirectByRoleGuardConfig: {
            //             redirects: {
            //                 '/admin/chat': [Roles.SocialMediaOfficer, Roles.Admin],
            //                 '/admin/system-monitoring': [Roles.SystemMonitoringOfficer],
            //                 '/admin/notifications': [Roles.NewsOfficer, Roles.Admin],
            //                 '/admin/app-members': [Roles.KYCOfficer, Roles.SupportOfficer]
            //             },
            //             defaultRedirect: `/${AppRoutes.Admin}/${AdminRoutes.Summary}`
            //         } as IRedirectByRoleGuardConfig
            //     }
            // },
            {
                path: '**',
                redirectTo: ''
            }
        ]
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRouterModule {
}
