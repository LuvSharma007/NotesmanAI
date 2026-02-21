import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
} from '@react-email/components';

interface ForgotPasswordEmailProps{
  username:string;
  resetUrl:string;
  userEmail:string;
}

const ForgotPasswordEmail = (props:ForgotPasswordEmailProps) => {
  const { username , resetUrl ,userEmail} = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto">
            {/* Header */}
            <Section className="px-[40px] pt-[40px] pb-[24px]">
              <Text className="text-[28px] font-bold text-gray-900 m-0 text-center">
                Reset Your Password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-[40px] pb-[32px]">
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[16px]">
                Hi ,{username}
              </Text>
              
              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[24px]">
                We received a request to reset the password for your account associated with <strong>{userEmail}</strong>. If you didn't make this request, you can safely ignore this email.
              </Text>

              <Text className="text-[16px] text-gray-700 leading-[24px] m-0 mb-[32px]">
                To reset your password, click the button below:
              </Text>

              {/* Reset Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
                >
                  Reset Password
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[16px]">
                This link will expire in 24 hours for security reasons.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-[20px] m-0 mb-[24px]">
                If the button doesn't work, you can copy and paste this link into your browser:
              </Text>

              <Text className="text-[14px] text-blue-600 leading-[20px] m-0 mb-[32px] break-all">
                {resetUrl}
              </Text>
            </Section>

            <Hr className="border-gray-200 mx-[40px]" />

            {/* Footer */}
            <Section className="px-[40px] py-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                If you have any questions or need assistance, please contact our support team.
              </Text>
              
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[16px]">
                Best regards,<br />
                The Security Team
              </Text>

              <Text className="text-[12px] text-gray-400 leading-[16px] m-0">
                © {new Date().getFullYear()} NotesmanAI AI. rights reserved.<br />
                Noida , Uttar Pradesh , IN<br />
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ForgotPasswordEmail;