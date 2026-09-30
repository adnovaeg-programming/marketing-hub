import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
  Preview,
} from "@react-email/components";

export function InvitationEmail({
  workspaceName,
  inviterName,
  role,
  inviteUrl,
}: {
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>تمت دعوتك للانضمام إلى {workspaceName}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Marketing Hub</Heading>
          <Hr style={hr} />

          <Section>
            <Text style={text}>مرحبًا 👋</Text>
            <Text style={text}>
              <strong>{inviterName}</strong> دعاك للانضمام إلى{" "}
              <strong>{workspaceName}</strong> بدور <strong>{role}</strong>.
            </Text>

            <Section style={btnSection}>
              <Button href={inviteUrl} style={btn}>
                اقبل الدعوة
              </Button>
            </Section>

            <Text style={muted}>
              الرابط صالح لمدة 7 أيام. لو مش عارف {inviterName}، تجاهل الرسالة دي.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} Marketing Hub — كل تسويقك في مكان واحد
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f3e8ff",
  fontFamily: "Cairo, Arial, sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "560px",
  margin: "0 auto",
  boxShadow: "0 8px 32px rgba(139,92,246,0.08)",
};

const h1 = {
  color: "#8b5cf6",
  fontSize: "24px",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const text = {
  color: "#1e1b4b",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "12px 0",
  direction: "rtl" as const,
  textAlign: "right" as const,
};

const btnSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const btn = {
  backgroundColor: "#8b5cf6",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 32px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "rgba(139,92,246,0.15)",
  margin: "24px 0",
};

const muted = {
  color: "#6b6487",
  fontSize: "12px",
  textAlign: "center" as const,
  direction: "rtl" as const,
};

const footer = {
  color: "#94a3b8",
  fontSize: "11px",
  textAlign: "center" as const,
};