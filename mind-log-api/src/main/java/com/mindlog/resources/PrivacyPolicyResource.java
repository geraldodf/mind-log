package com.mindlog.resources;

import com.mindlog.data.dtos.privacy.PrivacyPolicyDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/privacy-policy")
public class PrivacyPolicyResource {

    @GetMapping
    public ResponseEntity<PrivacyPolicyDTO> getPrivacyPolicy() {
        PrivacyPolicyDTO policy = new PrivacyPolicyDTO(
                "2026-03-14",
                "MindLog",
                "contato@daroz.dev",
                List.of(
                        new PrivacyPolicyDTO.PolicySection(
                                "1. What data we collect",
                                "MindLog collects only the minimum information necessary for the service to function:\n" +
                                "- Name and username chosen by you during registration\n" +
                                "- Email address, used for authentication and account recovery\n" +
                                "- Password (stored exclusively as a BCrypt hash — the original password is never stored)\n" +
                                "- Profile picture URL, when you sign in with Google\n" +
                                "- Media entries you create, including title, type, status, rating, notes, and review\n" +
                                "- Social interactions such as follows between accounts\n" +
                                "- Timestamps of when entries were created or updated"
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "2. Why we collect this data",
                                "All data collected is strictly necessary to provide the service:\n" +
                                "- Identification data (name, username, email) allows you to create and access your account\n" +
                                "- Media entries are the core content of MindLog — your personal media tracking library\n" +
                                "- Follow relationships enable the social features of the platform\n" +
                                "- Audit logs (containing only action type, entity ID, and timestamp) are kept for security and " +
                                "operational integrity. They do not contain personal content such as media titles or free-text fields"
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "3. How data is stored and protected",
                                "Your data is stored in a PostgreSQL database hosted on a private server.\n" +
                                "- All passwords are hashed with BCrypt before storage. Plaintext passwords are never saved\n" +
                                "- All API communication uses HTTPS (TLS encryption in transit)\n" +
                                "- Authentication is performed using short-lived JWT tokens. No session data is stored server-side\n" +
                                "- Access to the database and infrastructure is restricted to authorized administrators only\n" +
                                "- Media entries marked as Private are never exposed through the public profile API"
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "4. Data sharing and third parties",
                                "MindLog does not sell, rent, or share your personal data with third parties for commercial purposes.\n" +
                                "The only external service integrated is Google OAuth2, which is used solely for the optional " +
                                "\"Sign in with Google\" feature. When you choose this option, Google provides your name, " +
                                "email address, and profile picture. We do not receive your Google password or any other data " +
                                "beyond what is listed. Google's use of your data is governed by Google's own Privacy Policy."
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "5. Your rights (LGPD / GDPR)",
                                "Under the Brazilian Lei Geral de Proteção de Dados (LGPD) and equivalent regulations, you have the right to:\n" +
                                "- Access the personal data we hold about you\n" +
                                "- Correct inaccurate personal data through your profile settings\n" +
                                "- Delete your account and all associated personal data at any time via Settings > Delete Account. " +
                                "Account deletion is permanent and removes all your data immediately, including media entries, " +
                                "notes, reviews, and follow relationships. Only anonymised audit log records (with no personal identifiers) " +
                                "may be retained for security purposes\n" +
                                "- Port your data: you may request an export of your data by contacting us\n" +
                                "- Withdraw consent: you may stop using the service at any time"
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "6. Data retention",
                                "Your personal data is retained for as long as your account is active. " +
                                "When you delete your account, all personally identifiable data is permanently removed from our systems. " +
                                "Anonymised audit records (containing only action type, entity ID, and timestamp — no user identity) " +
                                "may be retained for up to 12 months for security auditing purposes."
                        ),
                        new PrivacyPolicyDTO.PolicySection(
                                "7. Contact and data deletion requests",
                                "If you have questions about this policy, wish to request a data export, or need assistance " +
                                "deleting your account, please contact us at: contato@daroz.dev\n" +
                                "We will respond to data-related requests within 15 business days."
                        )
                )
        );

        return ResponseEntity.ok(policy);
    }
}
