import { forwardRef } from 'react';
import BasicInfoView from './BasicInfoView';
import ContactInfoView from './ContactInfoView';
import EducationInfoView from './EducationInfoView';
import ExperienceInfoView from './ExperienceInfoView';
import SkillsInfoView from './SkillsInfoView';
import OtherInfoView from './OtherInfoView';

const Preview = forwardRef((props, ref) => {
  const { formData } = props;

  return (
    <div className="preview__container">
      <main className="preview__printable" ref={ref}>
        <BasicInfoView data={formData.basicInfo} />
        <ContactInfoView data={formData.contactInfo} />

        <section className="preview__main-col">
          <EducationInfoView data={formData.educationInfo} />
          <ExperienceInfoView data={formData.experienceInfo} />
        </section>

        <section className="preview__sidebar">
          <SkillsInfoView data={formData.skillsInfo} />
          <OtherInfoView data={formData.otherInfo} />
        </section>
      </main>
    </div>
  );
});

export default Preview;
